// ============================================================
// {{PRODUCT_NAME}} — i18n (Internationalisation)
// ============================================================
//
// Lightweight runtime i18n for the React UI.
// Chrome's built-in __MSG_*__ system handles manifest strings;
// this module handles everything else.
//
// Usage:
//   import { t, setLocale, initI18n } from '@/lib/i18n'
//   await initI18n()         // call once on startup
//   t('nav.home')            // → "Home" or "首页"
//   t('greeting', 'World')   // → "Hello, World!" (with interpolation)
//
// Adding a new locale:
//   1. Add translations to `messages` below
//   2. Add the locale code to the `Locale` type in types.ts
//   3. Add Chrome _locales/<code>/messages.json
//
// ============================================================

import { storage } from './storage'
import { STORAGE_KEYS } from './constants'
import type { Locale, Settings } from './types'

// --------------------------------------------------
// Translation dictionaries
// --------------------------------------------------

const messages: Record<Locale, Record<string, string>> = {
  en: {
    // App
    'app.name': '{{PRODUCT_NAME}}',
    'app.tagline': '{{PRODUCT_DESC}}',

    // Navigation
    'nav.home': 'Home',
    'nav.settings': 'Settings',
    'nav.about': 'About',

    // Home page
    'home.title': 'Welcome',
    'home.description': 'Get started by customizing this extension to fit your needs.',
    'home.cta': 'Get Started',

    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.theme.system': 'System',
    'settings.enabled': 'Enabled',
    'settings.saved': 'Settings saved',
    'settings.openFull': 'Open Full Settings',

    // License
    'license.title': 'License',
    'license.key': 'License Key',
    'license.keyPlaceholder': 'Enter your license key…',
    'license.activate': 'Activate',
    'license.deactivate': 'Deactivate',
    'license.status': 'Status',
    'license.active': 'Active',
    'license.inactive': 'Inactive',
    'license.expired': 'Expired',
    'license.validating': 'Validating…',
    'license.buyLink': 'Buy a license',

    // Auth
    'auth.signIn': 'Sign In',
    'auth.signOut': 'Sign Out',
    'auth.signedInAs': 'Signed in as',

    // About
    'about.title': 'About',
    'about.version': 'Version',
    'about.author': 'Author',
    'about.website': 'Website',
    'about.support': 'Support',
    'about.rateReview': 'Rate & Review',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading…',
    'common.error': 'Something went wrong',
    'common.success': 'Success',
  },

  zh: {
    // App
    'app.name': '{{PRODUCT_NAME}}',
    'app.tagline': '{{PRODUCT_DESC}}',

    // Navigation
    'nav.home': '首页',
    'nav.settings': '设置',
    'nav.about': '关于',

    // Home page
    'home.title': '欢迎',
    'home.description': '开始自定义此扩展程序以满足您的需求。',
    'home.cta': '开始使用',

    // Settings
    'settings.title': '设置',
    'settings.language': '语言',
    'settings.theme': '主题',
    'settings.theme.light': '浅色',
    'settings.theme.dark': '深色',
    'settings.theme.system': '跟随系统',
    'settings.enabled': '已启用',
    'settings.saved': '设置已保存',
    'settings.openFull': '打开完整设置',

    // License
    'license.title': '许可证',
    'license.key': '许可证密钥',
    'license.keyPlaceholder': '输入您的许可证密钥…',
    'license.activate': '激活',
    'license.deactivate': '取消激活',
    'license.status': '状态',
    'license.active': '已激活',
    'license.inactive': '未激活',
    'license.expired': '已过期',
    'license.validating': '验证中…',
    'license.buyLink': '购买许可证',

    // Auth
    'auth.signIn': '登录',
    'auth.signOut': '退出登录',
    'auth.signedInAs': '当前登录',

    // About
    'about.title': '关于',
    'about.version': '版本',
    'about.author': '作者',
    'about.website': '网站',
    'about.support': '支持',
    'about.rateReview': '评分与评论',

    // Common
    'common.save': '保存',
    'common.cancel': '取消',
    'common.loading': '加载中…',
    'common.error': '出了点问题',
    'common.success': '成功',
  },
}

// --------------------------------------------------
// State
// --------------------------------------------------

let currentLocale: Locale = 'en'

// --------------------------------------------------
// Public API
// --------------------------------------------------

/**
 * Translate a key, with optional positional interpolation.
 *
 *   t('greeting', 'World')  // "Hello, $1!" → "Hello, World!"
 */
export function t(key: string, ...args: string[]): string {
  let text = messages[currentLocale]?.[key] ?? messages['en']?.[key] ?? key
  args.forEach((arg, i) => {
    text = text.replace(`$${i + 1}`, arg)
  })
  return text
}

export function getLocale(): Locale {
  return currentLocale
}

export async function setLocale(locale: Locale): Promise<void> {
  currentLocale = locale
  const settings = await storage.get<Settings>(STORAGE_KEYS.SETTINGS) ?? {} as Settings
  await storage.set(STORAGE_KEYS.SETTINGS, { ...settings, locale })
}

/** Call once when the popup / options page mounts */
export async function initI18n(): Promise<void> {
  const settings = await storage.get<Settings>(STORAGE_KEYS.SETTINGS)
  if (settings?.locale) {
    currentLocale = settings.locale
  } else {
    // Detect from browser
    const browserLang = navigator.language.split('-')[0]
    currentLocale = browserLang === 'zh' ? 'zh' : 'en'
  }
}

/** Get all available locales (for a language picker) */
export function getAvailableLocales(): { code: Locale; label: string }[] {
  return [
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' },
  ]
}
