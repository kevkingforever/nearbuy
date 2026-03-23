"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, MessageCircle, ChevronRight, Clock, Check, CheckCheck, Store } from "lucide-react"
import { api } from "@/lib/api/client"
import type { Conversation } from "@/lib/api/types"
import { useAuthStore } from "@/lib/stores/auth-store"
import { MobileShell } from "@/components/layout/mobile-shell"
import { formatRelativeTime } from "@/lib/utils"

export default function ChatListPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    const fetchConversations = async () => {
      try {
        const response = await api.chat.getConversations()
        if (response.data) {
          setConversations(response.data.items)
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [isAuthenticated, router])

  const filteredConversations = conversations.filter(conv => 
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-4 h-4 text-muted-foreground" />
      case "delivered":
        return <CheckCheck className="w-4 h-4 text-muted-foreground" />
      case "read":
        return <CheckCheck className="w-4 h-4 text-primary" />
      default:
        return <Clock className="w-3 h-3 text-muted-foreground" />
    }
  }

  if (loading) {
    return (
      <MobileShell>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </MobileShell>
    )
  }

  return (
    <MobileShell>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="sticky top-0 bg-background z-10 px-4 pt-4 pb-2 border-b">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          
          {/* Search */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 px-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">No messages yet</h3>
              <p className="text-sm text-muted-foreground text-center">
                Start a conversation with a vendor by visiting their product page
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => router.push(`/chat/${conversation.id}`)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-muted overflow-hidden">
                      {conversation.participantImage ? (
                        <Image
                          src={conversation.participantImage}
                          alt={conversation.participantName}
                          width={56}
                          height={56}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {conversation.isOnline && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate">{conversation.participantName}</h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatRelativeTime(conversation.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {conversation.lastMessageSenderId === user?.id && (
                        getMessageStatusIcon(conversation.lastMessageStatus || "sent")
                      )}
                      <p className={`text-sm truncate ${
                        conversation.unreadCount > 0 
                          ? "font-medium text-foreground" 
                          : "text-muted-foreground"
                      }`}>
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>

                  {/* Unread Badge */}
                  {conversation.unreadCount > 0 && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary-foreground">
                        {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  )
}
