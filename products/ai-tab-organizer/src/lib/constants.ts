// ============================================================
// TabFlow AI — Constants
// ============================================================

/** Extension metadata */
export const PRODUCT_NAME = 'TabFlow AI'
export const PRODUCT_SLUG = 'tabflow-ai'
export const PRODUCT_DESC = 'AI-powered tab organizer that automatically groups, saves memory, and finds any tab instantly'

/** Author */
export const AUTHOR_NAME = ''
export const AUTHOR_URL = ''

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
  TAB_USAGE: 'tab_usage',
  SAVED_SESSIONS: 'saved_sessions',
  DOMAIN_COLORS: 'domain_colors',
  TAB_LAST_ACTIVE: 'tab_last_active',
} as const

/** LemonSqueezy */
export const LEMONSQUEEZY = {
  API_URL: 'https://api.lemonsqueezy.com/v1',
  STORE_ID: '',
  PRODUCT_ID: '',
} as const

/** Auth (optional SaaS backend) */
export const AUTH = {
  API_URL: '',
  AUTH_URL: '',
  CLIENT_ID: '',
} as const

/** Alarm names */
export const ALARMS = {
  LICENSE_CHECK: 'license-check',
  PERIODIC_SYNC: 'periodic-sync',
  SUSPEND_CHECK: 'suspend-check',
  STATS_UPDATE: 'stats-update',
} as const

/** Tab group color palette (Chrome's built-in colors) */
export const GROUP_COLORS: chrome.tabGroups.ColorEnum[] = [
  'blue',
  'red',
  'yellow',
  'green',
  'pink',
  'purple',
  'cyan',
  'orange',
  'grey',
]

/** Smart grouping keyword mappings */
export const SMART_GROUPS: Array<{ keywords: string[]; groupName: string }> = [
  { keywords: ['react', 'reactjs', 'react.dev'], groupName: 'React' },
  { keywords: ['vue', 'vuejs', 'vuejs.org'], groupName: 'Vue' },
  { keywords: ['angular', 'angularjs'], groupName: 'Angular' },
  { keywords: ['typescript', 'typescriptlang'], groupName: 'TypeScript' },
  { keywords: ['python', 'pypi', 'django', 'flask'], groupName: 'Python' },
  { keywords: ['rust', 'crates.io', 'rust-lang'], groupName: 'Rust' },
  { keywords: ['docker', 'kubernetes', 'k8s'], groupName: 'DevOps' },
  { keywords: ['aws', 'amazon web services', 'ec2', 's3'], groupName: 'AWS' },
  { keywords: ['figma', 'sketch', 'design'], groupName: 'Design' },
  { keywords: ['chatgpt', 'openai', 'claude', 'anthropic', 'gemini', 'ai'], groupName: 'AI' },
]

/** Domain display name overrides */
export const DOMAIN_NAMES: Record<string, string> = {
  'github.com': 'GitHub',
  'stackoverflow.com': 'Stack Overflow',
  'youtube.com': 'YouTube',
  'twitter.com': 'Twitter/X',
  'x.com': 'Twitter/X',
  'reddit.com': 'Reddit',
  'docs.google.com': 'Google Docs',
  'mail.google.com': 'Gmail',
  'calendar.google.com': 'Google Calendar',
  'drive.google.com': 'Google Drive',
  'notion.so': 'Notion',
  'linear.app': 'Linear',
  'slack.com': 'Slack',
  'discord.com': 'Discord',
  'figma.com': 'Figma',
  'vercel.com': 'Vercel',
  'netlify.com': 'Netlify',
  'npmjs.com': 'npm',
  'medium.com': 'Medium',
  'dev.to': 'DEV',
  'localhost': 'Localhost',
}

/** Average memory per tab estimate in MB */
export const AVG_TAB_MEMORY_MB = 80
/** Discarded tab memory estimate in MB */
export const DISCARDED_TAB_MEMORY_MB = 10
