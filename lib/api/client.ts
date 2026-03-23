import type {
  ApiResponse,
  PageResponse,
  AuthenticationResponse,
  CurrentUserResponse,
  RefreshAccessTokenResponse,
  EmailRegistrationResponse,
  CategoryResponse,
  FeedResponse,
  DiscoveryProductResponse,
  ProductResponse,
  VendorProfileResponse,
  VendorAnalyticsResponse,
  ConversationSummaryResponse,
  ConversationMessageResponse,
  UnreadConversationCountResponse,
  OrderSummaryResponse,
  OrderDetailResponse,
  OrderCheckoutResponse,
  OrderVerificationResponse,
  OrderConfirmationResponse,
  SavedItemResponse,
  DeliveryTrackingEventResponse,
  UserTrustScoreResponse,
  DisputeResponse,
  FeedQuery,
  DiscoveryProductsQuery,
  SearchQuery,
} from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1"

class ApiClient {
  private accessToken: string | null = null

  setAccessToken(token: string | null) {
    this.accessToken = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.accessToken) {
      ;(headers as Record<string, string>)["Authorization"] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(data.message || "An error occurred", response.status, data)
    }

    return data
  }

  private async uploadFile<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {}

    if (this.accessToken) {
      ;(headers as Record<string, string>)["Authorization"] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(data.message || "An error occurred", response.status, data)
    }

    return data
  }

  // ==================== AUTH ====================

  async registerWithEmail(email: string, password: string, role: "BUYER" | "VENDOR" = "BUYER") {
    return this.request<EmailRegistrationResponse>("/auth/register/email", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    })
  }

  async verifyRegistrationEmail(token: string) {
    return this.request<null>("/auth/register/email/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
  }

  async resendRegistrationVerification(email: string) {
    return this.request<null>("/auth/register/email/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async loginWithEmail(email: string, password: string) {
    return this.request<AuthenticationResponse>("/auth/login/email", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async requestPhoneOtpForRegister(phone: string) {
    return this.request<null>("/auth/register/phone/request-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    })
  }

  async verifyPhoneRegistration(phone: string, otp: string, role: "BUYER" | "VENDOR" = "BUYER") {
    return this.request<AuthenticationResponse>("/auth/register/phone/verify", {
      method: "POST",
      body: JSON.stringify({ phone, otp, role }),
    })
  }

  async requestPhoneOtpForLogin(phone: string) {
    return this.request<null>("/auth/login/phone/request-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    })
  }

  async verifyPhoneLogin(phone: string, otp: string) {
    return this.request<AuthenticationResponse>("/auth/login/phone/verify", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    })
  }

  async refreshToken(refreshToken: string) {
    return this.request<RefreshAccessTokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    })
  }

  async logout(refreshToken: string) {
    return this.request<null>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    })
  }

  async getCurrentUser() {
    return this.request<CurrentUserResponse>("/auth/me")
  }

  // ==================== USER ACCOUNT ====================

  async getUserProfile() {
    return this.request<CurrentUserResponse>("/users/me")
  }

  async updateUserProfile(displayName: string) {
    return this.request<CurrentUserResponse>("/users/me", {
      method: "PUT",
      body: JSON.stringify({ displayName }),
    })
  }

  async getUserLocation() {
    return this.request<{ city: string; latitude: number; longitude: number }>("/users/me/location")
  }

  async updateUserLocation(city: string, latitude: number, longitude: number) {
    return this.request<{ city: string; latitude: number; longitude: number }>("/users/me/location", {
      method: "PUT",
      body: JSON.stringify({ city, latitude, longitude }),
    })
  }

  async uploadUserAvatar(file: File) {
    const formData = new FormData()
    formData.append("file", file)
    return this.uploadFile<{ avatarUrl: string }>("/users/me/avatar", formData)
  }

  async upgradeToVendor() {
    return this.request<AuthenticationResponse>("/users/me/upgrade-vendor", {
      method: "POST",
    })
  }

  async attachEmail(email: string) {
    return this.request<{ email: string; verificationRequired: boolean }>("/users/me/email", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async verifyAttachedEmail(token: string) {
    return this.request<null>("/users/me/email/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
  }

  // ==================== CATEGORIES & FEED ====================

  async getCategories() {
    return this.request<CategoryResponse[]>("/categories")
  }

  async getFeed(query: FeedQuery) {
    const params = new URLSearchParams({
      city: query.city,
      lat: String(query.lat),
      lng: String(query.lng),
      ...(query.radius && { radius: String(query.radius) }),
    })
    return this.request<FeedResponse>(`/feed?${params}`)
  }

  async getProducts(query: DiscoveryProductsQuery) {
    const params = new URLSearchParams({
      city: query.city,
      lat: String(query.lat),
      lng: String(query.lng),
      ...(query.category && { category: query.category }),
      ...(query.radius && { radius: String(query.radius) }),
      ...(query.page !== undefined && { page: String(query.page) }),
      ...(query.size && { size: String(query.size) }),
    })
    return this.request<PageResponse<DiscoveryProductResponse>>(`/products?${params}`)
  }

  async searchProducts(query: SearchQuery) {
    const params = new URLSearchParams({
      q: query.q,
      city: query.city,
      lat: String(query.lat),
      lng: String(query.lng),
      ...(query.category && { category: query.category }),
      ...(query.radius && { radius: String(query.radius) }),
      ...(query.page !== undefined && { page: String(query.page) }),
      ...(query.size && { size: String(query.size) }),
    })
    return this.request<PageResponse<DiscoveryProductResponse>>(`/search?${params}`)
  }

  // ==================== PRODUCTS ====================

  async getProduct(id: string) {
    return this.request<ProductResponse>(`/products/${id}`)
  }

  async createProduct(product: {
    title: string
    description?: string | null
    price: string | number
    category: string
    city: string
    latitude: number
    longitude: number
    pickupAvailable: boolean
    details?: Record<string, unknown> | null
  }) {
    return this.request<ProductResponse>("/products", {
      method: "POST",
      body: JSON.stringify(product),
    })
  }

  async updateProduct(id: string, product: {
    title: string
    description?: string | null
    price: string | number
    category: string
    city: string
    latitude: number
    longitude: number
    pickupAvailable: boolean
    details?: Record<string, unknown> | null
  }) {
    return this.request<ProductResponse>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    })
  }

  async deleteProduct(id: string) {
    return this.request<null>(`/products/${id}`, {
      method: "DELETE",
    })
  }

  async getVendorProducts(vendorId: string, page = 0, size = 20) {
    return this.request<PageResponse<ProductResponse>>(
      `/vendors/${vendorId}/products?page=${page}&size=${size}`
    )
  }

  // ==================== VENDOR ====================

  async createVendorProfile(profile: {
    businessName: string
    description?: string | null
    whatsappNumber?: string | null
    phoneNumber?: string | null
    city: string
    primaryCategory: string
  }) {
    return this.request<VendorProfileResponse>("/vendors/profile", {
      method: "POST",
      body: JSON.stringify(profile),
    })
  }

  async getVendorProfile(id: string) {
    return this.request<VendorProfileResponse>(`/vendors/${id}`)
  }

  async updateVendorProfile(profile: {
    businessName: string
    description?: string | null
    whatsappNumber?: string | null
    phoneNumber?: string | null
    city: string
  }) {
    return this.request<VendorProfileResponse>("/vendors/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    })
  }

  async uploadVendorLogo(file: File) {
    const formData = new FormData()
    formData.append("file", file)
    return this.uploadFile<{ logoUrl: string }>("/vendors/logo", formData)
  }

  async getVendorAnalytics() {
    return this.request<VendorAnalyticsResponse>("/vendors/me/analytics")
  }

  async getVendorTrustScore(vendorId: string) {
    return this.request<UserTrustScoreResponse>(`/vendors/${vendorId}/trust-score`)
  }

  // ==================== SAVED ITEMS ====================

  async saveProduct(productId: string) {
    return this.request<null>(`/saved-items/${productId}`, {
      method: "POST",
    })
  }

  async removeSavedProduct(productId: string) {
    return this.request<null>(`/saved-items/${productId}`, {
      method: "DELETE",
    })
  }

  async getSavedItems(page = 0, size = 20) {
    return this.request<PageResponse<SavedItemResponse>>(
      `/saved-items?page=${page}&size=${size}`
    )
  }

  // ==================== MESSAGING ====================

  async startConversation(vendorProfileId: string, message: string) {
    return this.request<ConversationSummaryResponse>("/conversations", {
      method: "POST",
      body: JSON.stringify({ vendorProfileId, message }),
    })
  }

  async getConversations(page = 0, size = 20) {
    return this.request<PageResponse<ConversationSummaryResponse>>(
      `/conversations?page=${page}&size=${size}`
    )
  }

  async getConversationMessages(conversationId: string, page = 0, size = 20) {
    return this.request<PageResponse<ConversationMessageResponse>>(
      `/conversations/${conversationId}/messages?page=${page}&size=${size}`
    )
  }

  async sendMessage(conversationId: string, content: string) {
    return this.request<ConversationMessageResponse>(
      `/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ content }),
      }
    )
  }

  async markConversationAsRead(conversationId: string) {
    return this.request<null>(`/conversations/${conversationId}/read`, {
      method: "POST",
    })
  }

  async getUnreadCount() {
    return this.request<UnreadConversationCountResponse>("/conversations/unread-count")
  }

  // ==================== ORDERS ====================

  async createCheckoutOrder(productId: string, fulfillmentType: "PICKUP" | "DELIVERY", deliveryAddressText?: string, buyerNote?: string) {
    return this.request<OrderCheckoutResponse>("/orders/checkout", {
      method: "POST",
      body: JSON.stringify({
        productId,
        fulfillmentType,
        deliveryAddressText,
        buyerNote,
      }),
    })
  }

  async getOrders(page = 0, size = 20) {
    return this.request<PageResponse<OrderSummaryResponse>>(
      `/orders?page=${page}&size=${size}`
    )
  }

  async getOrder(orderId: string) {
    return this.request<OrderDetailResponse>(`/orders/${orderId}`)
  }

  async verifyOrderPayment(reference: string) {
    return this.request<OrderVerificationResponse>(`/orders/verify/${reference}`, {
      method: "POST",
    })
  }

  async confirmOrderReceipt(orderId: string) {
    return this.request<OrderConfirmationResponse>(`/orders/${orderId}/confirm`, {
      method: "POST",
    })
  }

  async getDeliveryEvents(orderId: string, page = 0, size = 20) {
    return this.request<PageResponse<DeliveryTrackingEventResponse>>(
      `/orders/${orderId}/delivery-events?page=${page}&size=${size}`
    )
  }

  // ==================== DISPUTES ====================

  async createDispute(orderId: string, reason: string, description: string) {
    return this.request<DisputeResponse>("/risk/disputes", {
      method: "POST",
      body: JSON.stringify({ orderId, reason, description }),
    })
  }

  async getDisputes(page = 0, size = 20) {
    return this.request<PageResponse<DisputeResponse>>(
      `/risk/disputes?page=${page}&size=${size}`
    )
  }

  async getDispute(disputeId: string) {
    return this.request<DisputeResponse>(`/risk/disputes/${disputeId}`)
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export const apiClient = new ApiClient()
