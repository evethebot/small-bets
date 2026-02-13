// ============================================================
// {{PRODUCT_NAME}} — Shared Types
// ============================================================

/** Supported locale codes */
export type Locale = 'en' | 'zh'

/** Chrome storage area selector */
export type StorageArea = 'sync' | 'local'

// --------------------------------------------------
// License / Payment
// --------------------------------------------------

export type LicenseStatus =
  | 'active'
  | 'inactive'
  | 'expired'
  | 'disabled'

export interface LicenseInfo {
  key: string
  status: LicenseStatus
  instanceId?: string
  activatedAt?: number
  expiresAt?: number
}

export interface LicenseValidationResponse {
  valid: boolean
  error?: string
  license_key?: {
    id: number
    status: string
    key: string
    activation_limit: number
    activation_usage: number
    expires_at: string | null
  }
  instance?: {
    id: string
    name: string
    created_at: string
  }
  meta?: {
    store_id: number
    product_id: number
    variant_id: number
    customer_id: number
  }
}

// --------------------------------------------------
// Auth
// --------------------------------------------------

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
}

export interface AuthState {
  isAuthenticated: boolean
  token?: string
  user?: User
  expiresAt?: number
}

// --------------------------------------------------
// Messages (background ↔ popup ↔ content)
// --------------------------------------------------

export type MessageType =
  | 'PING'
  | 'GET_STATUS'
  | 'CONTENT_LOADED'
  | 'OPEN_OPTIONS'
  | 'LICENSE_CHANGED'
  | 'AUTH_CHANGED'
  | 'PERFORM_ACTION'

export interface ExtensionMessage<T = unknown> {
  type: MessageType
  payload?: T
}

export interface ExtensionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// --------------------------------------------------
// Settings
// --------------------------------------------------

export interface Settings {
  locale: Locale
  theme: 'light' | 'dark' | 'system'
  enabled: boolean
  // Add product-specific settings below
}

export const DEFAULT_SETTINGS: Settings = {
  locale: 'en',
  theme: 'system',
  enabled: true,
}
