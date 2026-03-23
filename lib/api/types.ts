// API Response Types based on the API Contract

export type UserRole = "BUYER" | "VENDOR"
export type SubscriptionTier = "FREE" | "BASIC" | "FEATURED"

// Standard API envelope
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string
  timestamp: string
}

// Pagination
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// Validation errors
export interface ValidationError {
  field: string
  message: string
}

export interface ValidationErrorResponse {
  errors: ValidationError[]
}

// Auth Types
export interface RegisterEmailRequest {
  email: string
  password: string
  role: UserRole
}

export interface EmailRegistrationResponse {
  email: string
  verificationRequired: boolean
}

export interface VerifyEmailRequest {
  token: string
}

export interface LoginEmailRequest {
  email: string
  password: string
}

export interface AuthenticationResponse {
  userId: string
  role: UserRole
  accessToken: string
  refreshToken: string
}

export interface RequestPhoneOtpRequest {
  phone: string
}

export interface VerifyPhoneRegistrationRequest {
  phone: string
  otp: string
  role: UserRole
}

export interface VerifyPhoneLoginRequest {
  phone: string
  otp: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshAccessTokenResponse {
  accessToken: string
}

export interface UserLocationResponse {
  city: string
  latitude: number
  longitude: number
}

export interface CurrentUserResponse {
  userId: string
  role: UserRole
  email: string | null
  phone: string | null
  displayName: string | null
  avatarUrl: string | null
  verified: boolean
  location: UserLocationResponse | null
}

// OAuth2
export interface OAuth2SuccessQuery {
  accessToken: string
  refreshToken: string
  userId: string
  role: UserRole
}

export interface OAuth2ErrorQuery {
  error: "oauth2_authentication_failed"
  status: string
  message: string
}

// User Account
export interface UpdateCurrentUserRequest {
  displayName: string
}

export interface UpdateCurrentUserLocationRequest {
  city: string
  latitude: number
  longitude: number
}

export interface UserAvatarUploadResponse {
  avatarUrl: string
}

export interface AttachEmailRequest {
  email: string
}

export interface AttachEmailResponse {
  email: string
  verificationRequired: boolean
}

// Categories & Feed
export interface CategoryResponse {
  id: string
  name: string
  slug: string
  iconUrl: string | null
}

export interface DiscoveryProductResponse {
  id: string
  vendorId: string
  vendorName: string
  vendorLogoUrl: string | null
  title: string
  price: string
  category: string
  primaryImageUrl: string | null
  city: string
  distanceKm: number
  subscriptionTier: SubscriptionTier
  createdAt: string
}

export interface FeedResponse {
  nearby: DiscoveryProductResponse[]
  featured: DiscoveryProductResponse[]
  recent: DiscoveryProductResponse[]
  radiusKm: number
}

export interface FeedQuery {
  city: string
  lat: number
  lng: number
  radius?: number
}

export interface DiscoveryProductsQuery {
  category?: string
  city: string
  lat: number
  lng: number
  radius?: number
  page?: number
  size?: number
}

export interface SearchQuery {
  q: string
  category?: string
  city: string
  lat: number
  lng: number
  radius?: number
  page?: number
  size?: number
}

// Vendor Types
export interface CreateVendorProfileRequest {
  businessName: string
  description?: string | null
  whatsappNumber?: string | null
  phoneNumber?: string | null
  city: string
  primaryCategory: string
}

export interface VendorProfileResponse {
  id: string
  businessName: string
  description: string | null
  logoUrl: string | null
  whatsappNumber: string | null
  phoneNumber: string | null
  city: string
  primaryCategory: string
  subscriptionTier: SubscriptionTier
  verified: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateVendorProfileRequest {
  businessName: string
  description?: string | null
  whatsappNumber?: string | null
  phoneNumber?: string | null
  city: string
}

export interface VendorLogoUploadResponse {
  logoUrl: string
}

export interface VendorProductAnalyticsResponse {
  productId: string
  title: string
  active: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface VendorAnalyticsResponse {
  totalListings: number
  activeListings: number
  inactiveListings: number
  totalViews: number
  products: VendorProductAnalyticsResponse[]
}

// Products
export interface ProductCategoryDetailsRequest {
  electronics?: {
    serialNumber: string
    imei: string
  }
  furniture?: {
    widthCm: number
    heightCm: number
    depthCm: number
  }
  farmProduce?: {
    quantityValue: number
    quantityUnit: string
    harvestDate: string
  }
  vehicle?: {
    registrationNumber: string
  }
  propertyLand?: {
    titleDeedDocumentRef: string
    sitePlanDocumentRef: string
    indentureDocumentRef: string
    agentLicenseDocumentRef: string
  }
}

export interface CreateProductRequest {
  title: string
  description?: string | null
  price: string | number
  category: string
  city: string
  latitude: number
  longitude: number
  pickupAvailable: boolean
  details?: ProductCategoryDetailsRequest | null
}

export type FulfillmentPolicy = "PICKUP_OR_DELIVERY" | "PICKUP_ONLY"
export type TransactionMode = "STANDARD_COMMERCE" | "VEHICLE_DEPOSIT" | "PROPERTY_FACILITATION"

export interface ProductResponse {
  id: string
  vendorId: string
  title: string
  description: string | null
  price: string
  category: string
  images: string[]
  city: string
  pickupAvailable: boolean
  fulfillmentPolicy: FulfillmentPolicy
  transactionMode: TransactionMode
  active: boolean
  createdAt: string
  updatedAt: string
}

// Saved Items
export interface SavedItemResponse {
  productId: string
  vendorId: string
  vendorName: string
  title: string
  price: string
  category: string
  primaryImageUrl: string | null
  city: string
  savedAt: string
}

// Subscriptions
export interface InitiateSubscriptionRequest {
  tier: SubscriptionTier
}

export interface SubscriptionInitiationResponse {
  authorizationUrl: string
  reference: string
}

export interface SubscriptionVerificationResponse {
  reference: string
  tier: SubscriptionTier
  active: boolean
  startDate: string
  endDate: string
}

// Messaging
export interface CreateConversationRequest {
  vendorProfileId: string
  message: string
}

export interface ConversationSummaryResponse {
  id: string
  vendorProfileId: string
  vendorBusinessName: string
  counterpartyUserId: string
  counterpartyLabel: string
  counterpartyRole: UserRole
  lastMessageContent: string
  lastMessageAt: string
  unread: boolean
  lastMessageFromCurrentUser: boolean
  createdAt: string
}

export interface ConversationMessageResponse {
  id: string
  conversationId: string
  senderUserId: string
  senderRole: UserRole
  sentByCurrentUser: boolean
  content: string
  createdAt: string
}

export interface SendConversationMessageRequest {
  content: string
}

export interface UnreadConversationCountResponse {
  unreadCount: number
}

// Orders
export type OrderStatus = 
  | "PENDING_PAYMENT" 
  | "PAID" 
  | "PROCESSING" 
  | "READY_FOR_PICKUP" 
  | "OUT_FOR_DELIVERY" 
  | "DELIVERED" 
  | "COMPLETED" 
  | "CANCELLED"

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED"

export interface CreateCheckoutOrderRequest {
  productId: string
  fulfillmentType: "PICKUP" | "DELIVERY"
  deliveryAddressText?: string | null
  buyerNote?: string | null
}

export interface OrderCheckoutResponse {
  orderId: string
  authorizationUrl: string
  reference: string
  transactionMode: TransactionMode
  status: "PENDING_PAYMENT"
  paymentStatus: "PENDING"
}

export interface OrderSummaryResponse {
  orderId: string
  productId: string
  productTitle: string
  vendorId: string
  vendorName: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  fulfillmentType: "PICKUP" | "DELIVERY"
  transactionMode: TransactionMode
  totalAmount: string
  currency: string
  createdAt: string
  updatedAt: string
}

export interface OrderDetailResponse {
  orderId: string
  buyerId: string
  vendorId: string
  vendorName: string
  productId: string
  productTitle: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  fulfillmentType: "PICKUP" | "DELIVERY"
  transactionMode: TransactionMode
  unitPrice: string
  totalAmount: string
  currency: string
  deliveryAddressText: string | null
  buyerNote: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderVerificationResponse {
  orderId: string
  reference: string
  status: "PAID"
  paymentStatus: "SUCCESS"
  paidAt: string
}

export interface OrderConfirmationResponse {
  orderId: string
  status: "COMPLETED"
  paymentStatus: "SUCCESS"
  updatedAt: string
}

// Delivery Tracking
export type DeliveryTrackingStatus = 
  | "PROCESSING"
  | "READY_FOR_PICKUP"
  | "RIDER_ASSIGNED"
  | "OUT_FOR_DELIVERY"
  | "ARRIVING_SOON"
  | "PICKED_UP"
  | "DELIVERED"
  | "DELAYED"

export interface DeliveryTrackingEventResponse {
  eventId: string
  orderId: string
  actorUserId: string | null
  status: DeliveryTrackingStatus
  note: string | null
  locationLabel: string | null
  latitude: number | null
  longitude: number | null
  createdAt: string
}

// Trust Score
export interface UserTrustScoreResponse {
  vendorId: string
  userId: string
  totalScore: number
  verificationScore: number
  fulfillmentScore: number
  reviewScore: number
  disputeScore: number
  riskScore: number
  identityVerified: boolean
  vendorVerified: boolean
  averageRating: string
  reviewCount: number
  fulfilledOrderCount: number
  activeDisputeCount: number
  highRiskSignalCount: number
  lastRecalculatedAt: string
}

// Disputes
export type DisputeReason = 
  | "ITEM_NOT_RECEIVED"
  | "ITEM_NOT_AS_DESCRIBED"
  | "PAYMENT_ISSUE"
  | "OTHER"

export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED"

export interface CreateDisputeRequest {
  orderId: string
  reason: DisputeReason
  description: string
}

export interface DisputeResponse {
  id: string
  orderId: string
  createdByUserId: string
  reason: DisputeReason
  description: string
  status: DisputeStatus
  resolutionNote: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
}
