// ============================================================
// {{PRODUCT_NAME}} — Constants
// ============================================================

/** Extension metadata — replaced by the generator script */
export const PRODUCT_NAME = '{{PRODUCT_NAME}}'
export const PRODUCT_SLUG = '{{PRODUCT_SLUG}}'
export const PRODUCT_DESC = '{{PRODUCT_DESC}}'

/** Author */
export const AUTHOR_NAME = '{{AUTHOR_NAME}}'
export const AUTHOR_URL = '{{AUTHOR_URL}}'

/** Links */
export const STORE_URL = `https://chromewebstore.google.com/detail/${PRODUCT_SLUG}`
export const SUPPORT_URL = `${AUTHOR_URL}/support`
export const FEEDBACK_URL = `${AUTHOR_URL}/feedback`

/** Storage keys (single source of truth) */
export const STORAGE_KEYS = {
  SETTINGS: 'settings',
  LICENSE: 'license',
  AUTH: 'auth',
  ONBOARDED: 'onboarded',
} as const

/** LemonSqueezy */
export const LEMONSQUEEZY = {
  API_URL: 'https://api.lemonsqueezy.com/v1',
  STORE_ID: '{{LEMONSQUEEZY_STORE_ID}}',
  PRODUCT_ID: '{{LEMONSQUEEZY_PRODUCT_ID}}',
} as const

/** Auth (optional SaaS backend) */
export const AUTH = {
  API_URL: '{{API_URL}}',
  AUTH_URL: '{{AUTH_URL}}',
  CLIENT_ID: '{{OAUTH_CLIENT_ID}}',
} as const

/** Alarm names */
export const ALARMS = {
  LICENSE_CHECK: 'license-check',
  PERIODIC_SYNC: 'periodic-sync',
} as const
