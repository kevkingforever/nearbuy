"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Phone, MoreVertical, Send, Camera, Paperclip, Mic, Check, CheckCheck, Clock, ShoppingBag, Store, AlertCircle, Shield } from "lucide-react"
import { api } from "@/lib/api/client"
import type { Message, Conversation, Product } from "@/lib/api/types"
import { useAuthStore } from "@/lib/stores/auth-store"
import { formatRelativeTime, formatCurrency } from "@/lib/utils"

export default function ChatDetailPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string
  const { user } = useAuthStore()
  
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [convRes, messagesRes] = await Promise.all([
          api.chat.getConversation(conversationId),
          api.chat.getMessages(conversationId, { page: 1, limit: 50 })
        ])
        if (convRes.data) setConversation(convRes.data)
        if (messagesRes.data) setMessages(messagesRes.data.items.reverse())
        
        // Mark as read
        await api.chat.markAsRead(conversationId)
      } catch (error) {
        console.error("Failed to fetch chat:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(async () => {
      try {
        const response = await api.chat.getMessages(conversationId, { page: 1, limit: 50 })
        if (response.data) {
          setMessages(response.data.items.reverse())
        }
      } catch (error) {
        // Silently fail polling
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return

    const messageText = newMessage.trim()
    setNewMessage("")
    setSending(true)

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: user?.id || "",
      content: messageText,
      type: "text",
      status: "sending",
      createdAt: new Date().toISOString()
    }
    setMessages(prev => [...prev, optimisticMessage])

    try {
      const response = await api.chat.sendMessage(conversationId, { content: messageText, type: "text" })
      if (response.data) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticMessage.id ? response.data! : msg
          )
        )
      }
    } catch (error) {
      // Mark message as failed
      setMessages(prev =>
        prev.map(msg =>
          msg.id === optimisticMessage.id
            ? { ...msg, status: "failed" }
            : msg
        )
      )
    } finally {
      setSending(false)
    }
  }

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case "sending":
        return <Clock className="w-3 h-3 text-primary-foreground/60" />
      case "sent":
        return <Check className="w-3 h-3 text-primary-foreground/60" />
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-primary-foreground/60" />
      case "read":
        return <CheckCheck className="w-3 h-3 text-primary-foreground" />
      case "failed":
        return <AlertCircle className="w-3 h-3 text-red-400" />
      default:
        return null
    }
  }

  const renderMessage = (message: Message, index: number) => {
    const isOwn = message.senderId === user?.id
    const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.senderId !== message.senderId)
    const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.senderId !== message.senderId

    if (message.type === "product_inquiry") {
      return (
        <div key={message.id} className="px-4 py-2">
          <div className={`max-w-[85%] ${isOwn ? "ml-auto" : ""}`}>
            <div className="bg-muted rounded-xl p-3 mb-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <ShoppingBag className="w-3 h-3" />
                <span>Product Inquiry</span>
              </div>
              {message.productData && (
                <div className="flex gap-3 p-2 bg-background rounded-lg">
                  <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden relative">
                    {message.productData.image && (
                      <Image
                        src={message.productData.image}
                        alt={message.productData.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{message.productData.name}</p>
                    <p className="text-primary font-semibold">
                      {formatCurrency(message.productData.price)}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className={`${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-2xl px-4 py-2`}>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={message.id} className={`flex items-end gap-2 px-4 ${isOwn ? "flex-row-reverse" : ""} ${isLastInGroup ? "mb-3" : "mb-1"}`}>
        {!isOwn && (
          <div className="w-8 h-8 flex-shrink-0">
            {showAvatar && (
              <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                {conversation?.participantImage ? (
                  <Image
                    src={conversation.participantImage}
                    alt={conversation.participantName}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwn
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted rounded-bl-md"
            }`}
          >
            {message.type === "image" && message.imageUrl && (
              <div className="w-48 h-48 rounded-lg overflow-hidden mb-2 relative">
                <Image
                  src={message.imageUrl}
                  alt="Shared image"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
          
          {isLastInGroup && (
            <div className={`flex items-center gap-1 mt-1 ${isOwn ? "flex-row-reverse" : ""}`}>
              <span className="text-[10px] text-muted-foreground">
                {formatRelativeTime(message.createdAt)}
              </span>
              {isOwn && getMessageStatusIcon(message.status)}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => router.push(`/vendor/${conversation?.participantId}`)}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                {conversation?.participantImage ? (
                  <Image
                    src={conversation.participantImage}
                    alt={conversation.participantName}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              {conversation?.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h2 className="font-semibold truncate">{conversation?.participantName}</h2>
              <p className="text-xs text-muted-foreground">
                {conversation?.isOnline ? "Online" : `Last seen ${formatRelativeTime(conversation?.lastSeenAt || "")}`}
              </p>
            </div>
          </button>

          <button className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Banner */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-amber-700 dark:text-amber-400">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <p className="text-xs">Use NearBuy escrow for safe transactions. Never pay outside the app.</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Store className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Start a conversation</h3>
            <p className="text-sm text-muted-foreground text-center">
              Say hello to {conversation?.participantName}
            </p>
          </div>
        ) : (
          messages.map((message, index) => renderMessage(message, index))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t p-4 pb-safe">
        <div className="flex items-end gap-2">
          <button className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center flex-shrink-0">
            <Camera className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center flex-shrink-0">
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              className="w-full px-4 py-3 bg-muted rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {newMessage.trim() ? (
            <button
              onClick={handleSend}
              disabled={sending}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 disabled:opacity-50"
            >
              <Send className="w-5 h-5 text-primary-foreground" />
            </button>
          ) : (
            <button className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center flex-shrink-0">
              <Mic className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
