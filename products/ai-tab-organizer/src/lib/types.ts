// ============================================================
// TabFlow AI — Shared Types
// ============================================================

/** Supported locale codes */
export type Locale = 'en' | 'zh'

/** Chrome storage area selector */
export type StorageArea = 'sync' | 'local'

/** Theme options */
export type Theme = 'light' | 'dark' | 'system'

// --------------------------------------------------
// Tab Management
// --------------------------------------------------

export interface TabInfo {
  id: number
  windowId: number
  url: string
  title: string
  favIconUrl?: string
  domain: string
  groupId: number
  lastActiveAt: number
  createdAt: number
  isDiscarded: boolean
  isDuplicate: boolean
  memoryEstimateMB: number
}

export interface TabGroup {
  id: number
  title: string
  color: chrome.tabGroups.ColorEnum
  collapsed: boolean
  tabs: TabInfo[]
  domain?: string
}

export interface TabStats {
  totalTabs: number
  groupedTabs: number
  duplicateTabs: number
  discardedTabs: number
  memorySavedMB: number
  totalMemoryMB: number
}

export interface TabUsageEntry {
  tabId: number
  url: string
  domain: string
  visitCount: number
  totalActiveMs: number
  lastVisitAt: number
}

export interface SavedSession {
  id: string
  name: string
  createdAt: number
  tabs: Array<{
    url: string
    title: string
    groupName?: string
    groupColor?: chrome.tabGroups.ColorEnum
  }>
}

// --------------------------------------------------
// Domain Grouping
// --------------------------------------------------

export interface DomainGroupRule {
  pattern: string // domain or glob pattern
  groupName: string
  color?: chrome.tabGroups.ColorEnum
}

export interface SmartGroupKeyword {
  keywords: string[]
  groupName: string
}

// --------------------------------------------------
// Settings
// --------------------------------------------------

export interface Settings {
  locale: Locale
  theme: Theme
  autoOrganize: boolean
  suspendTimeout: 15 | 30 | 60 | 0 // minutes, 0 = never
  customRules: DomainGroupRule[]
  excludedSites: string[]
  // From template
  enabled: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  locale: 'en',
  theme: 'system',
  autoOrganize: true,
  suspendTimeout: 30,
  customRules: [],
  excludedSites: [],
  enabled: true,
}

// --------------------------------------------------
// Messages (background ↔ popup)
// --------------------------------------------------

export type MessageType =
  | 'PING'
  | 'GET_STATUS'
  | 'GET_TABS'
  | 'GET_STATS'
  | 'ORGANIZE_NOW'
  | 'CLOSE_DUPLICATES'
  | 'CLOSE_INACTIVE'
  | 'SAVE_SESSION'
  | 'RESTORE_SESSION'
  | 'DELETE_SESSION'
  | 'GET_SESSIONS'
  | 'SWITCH_TO_TAB'
  | 'CLOSE_TAB'
  | 'SEARCH_TABS'
  | 'GET_SETTINGS'
  | 'UPDATE_SETTINGS'
  | 'OPEN_OPTIONS'
  | 'LICENSE_CHANGED'
  | 'AUTH_CHANGED'
  | 'CONTENT_LOADED'
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
