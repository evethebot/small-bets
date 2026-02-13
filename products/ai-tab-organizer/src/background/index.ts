// ============================================================
// TabFlow AI — Background Service Worker
// ============================================================
//
// Handles:
//   - Tab event listeners (create/update/remove)
//   - Auto-grouping by domain + smart keywords
//   - Tab suspension (memory saving)
//   - Tab usage tracking
//   - Session save/restore
//   - Message handling from popup
//
// ============================================================

import { storage } from '@/lib/storage'
import { STORAGE_KEYS, ALARMS, GROUP_COLORS, SMART_GROUPS, DOMAIN_NAMES, AVG_TAB_MEMORY_MB, DISCARDED_TAB_MEMORY_MB } from '@/lib/constants'
import type { Settings, TabInfo, TabStats, SavedSession, ExtensionMessage, ExtensionResponse, TabUsageEntry } from '@/lib/types'
import { DEFAULT_SETTINGS } from '@/lib/types'

// --------------------------------------------------
// Utilities
// --------------------------------------------------

function extractDomain(url: string): string {
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function getDomainDisplayName(domain: string): string {
  if (DOMAIN_NAMES[domain]) return DOMAIN_NAMES[domain]
  // Remove TLD for shorter group names
  const parts = domain.split('.')
  if (parts.length >= 2) {
    const name = parts[parts.length - 2]
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
  return domain
}

/** Deterministic color from domain string */
function colorForDomain(domain: string): chrome.tabGroups.ColorEnum {
  let hash = 0
  for (let i = 0; i < domain.length; i++) {
    hash = ((hash << 5) - hash + domain.charCodeAt(i)) | 0
  }
  return GROUP_COLORS[Math.abs(hash) % GROUP_COLORS.length]
}

/** Check if a URL is groupable (skip chrome://, edge://, etc.) */
function isGroupableUrl(url: string): boolean {
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://')
}

/** Check smart grouping: does the tab match a keyword group? */
function getSmartGroupName(url: string, title: string): string | null {
  const text = `${url} ${title}`.toLowerCase()
  for (const group of SMART_GROUPS) {
    if (group.keywords.some(kw => text.includes(kw.toLowerCase()))) {
      return group.groupName
    }
  }
  return null
}

// --------------------------------------------------
// Settings Cache
// --------------------------------------------------

let cachedSettings: Settings = { ...DEFAULT_SETTINGS }

async function loadSettings(): Promise<Settings> {
  const s = await storage.get<Settings>(STORAGE_KEYS.SETTINGS)
  if (s) {
    cachedSettings = { ...DEFAULT_SETTINGS, ...s }
  }
  return cachedSettings
}

// --------------------------------------------------
// Tab Last Active Tracking
// --------------------------------------------------

/** Map of tabId → last active timestamp */
const tabLastActive = new Map<number, number>()

async function persistLastActive(): Promise<void> {
  const obj: Record<string, number> = {}
  for (const [k, v] of tabLastActive) {
    obj[String(k)] = v
  }
  await storage.set(STORAGE_KEYS.TAB_LAST_ACTIVE, obj, 'local')
}

async function loadLastActive(): Promise<void> {
  const data = await storage.get<Record<string, number>>(STORAGE_KEYS.TAB_LAST_ACTIVE, 'local')
  if (data) {
    for (const [k, v] of Object.entries(data)) {
      tabLastActive.set(Number(k), v)
    }
  }
}

function markTabActive(tabId: number): void {
  tabLastActive.set(tabId, Date.now())
}

// --------------------------------------------------
// Tab Usage Stats
// --------------------------------------------------

async function recordTabVisit(tabId: number, url: string): Promise<void> {
  const domain = extractDomain(url)
  if (!domain) return

  const usage = (await storage.get<TabUsageEntry[]>(STORAGE_KEYS.TAB_USAGE, 'local')) ?? []
  const existing = usage.find(u => u.url === url)

  if (existing) {
    existing.visitCount++
    existing.lastVisitAt = Date.now()
    existing.tabId = tabId
  } else {
    usage.push({
      tabId,
      url,
      domain,
      visitCount: 1,
      totalActiveMs: 0,
      lastVisitAt: Date.now(),
    })
  }

  // Keep only last 500 entries
  const trimmed = usage.slice(-500)
  await storage.set(STORAGE_KEYS.TAB_USAGE, trimmed, 'local')
}

// --------------------------------------------------
// Auto-Grouping Engine
// --------------------------------------------------

async function getExistingGroups(windowId: number): Promise<Map<string, number>> {
  const groups = await chrome.tabGroups.query({ windowId })
  const map = new Map<string, number>()
  for (const g of groups) {
    if (g.title) {
      map.set(g.title, g.id)
    }
  }
  return map
}

async function organizeAllTabs(): Promise<void> {
  const settings = await loadSettings()
  const windows = await chrome.windows.getAll({ populate: false })

  for (const win of windows) {
    if (win.id === undefined) continue
    await organizeWindow(win.id, settings)
  }
}

async function organizeWindow(windowId: number, settings: Settings): Promise<void> {
  const tabs = await chrome.tabs.query({ windowId })
  const existingGroups = await getExistingGroups(windowId)

  // Group tabs by their target group name
  const groupMap = new Map<string, chrome.tabs.Tab[]>()

  for (const tab of tabs) {
    if (!tab.url || !tab.id || !isGroupableUrl(tab.url)) continue

    const domain = extractDomain(tab.url)

    // Check exclusion list
    if (settings.excludedSites.some(site => domain.includes(site))) continue

    // Check custom rules first
    const customRule = settings.customRules.find(r =>
      domain.includes(r.pattern) || tab.url!.includes(r.pattern)
    )

    let groupName: string

    if (customRule) {
      groupName = customRule.groupName
    } else {
      // Try smart grouping
      const smartName = getSmartGroupName(tab.url, tab.title ?? '')
      if (smartName) {
        groupName = smartName
      } else {
        // Fall back to domain grouping
        groupName = getDomainDisplayName(domain)
      }
    }

    const existing = groupMap.get(groupName) ?? []
    existing.push(tab)
    groupMap.set(groupName, existing)
  }

  // Only create groups for domains with 2+ tabs (or existing groups)
  for (const [groupName, groupTabs] of groupMap) {
    if (groupTabs.length < 2 && !existingGroups.has(groupName)) continue

    const tabIds = groupTabs.map(t => t.id!).filter(Boolean)
    if (tabIds.length === 0) continue

    const existingGroupId = existingGroups.get(groupName)

    if (existingGroupId !== undefined) {
      // Add tabs to existing group
      try {
        await chrome.tabs.group({ tabIds, groupId: existingGroupId })
      } catch {
        // Group may have been closed
      }
    } else {
      // Create new group
      try {
        const groupId = await chrome.tabs.group({ tabIds, createProperties: { windowId } })
        const domain = extractDomain(groupTabs[0].url ?? '')
        const customRule = cachedSettings.customRules.find(r => domain.includes(r.pattern))
        const color = customRule?.color ?? colorForDomain(groupName)

        await chrome.tabGroups.update(groupId, {
          title: groupName,
          color,
          collapsed: false,
        })
      } catch {
        // Tab may have been closed during operation
      }
    }
  }
}

// --------------------------------------------------
// Tab Suspension (Memory Saving)
// --------------------------------------------------

async function checkAndSuspendTabs(): Promise<void> {
  const settings = await loadSettings()
  if (settings.suspendTimeout === 0) return // Disabled

  const timeoutMs = settings.suspendTimeout * 60 * 1000
  const now = Date.now()
  const tabs = await chrome.tabs.query({})

  for (const tab of tabs) {
    if (!tab.id || tab.active || tab.discarded || tab.pinned) continue
    if (!tab.url || !isGroupableUrl(tab.url)) continue

    const domain = extractDomain(tab.url)
    if (settings.excludedSites.some(site => domain.includes(site))) continue

    // Check if tab has been inactive long enough
    const lastActive = tabLastActive.get(tab.id) ?? tab.lastAccessed ?? 0
    if (now - lastActive > timeoutMs) {
      try {
        await chrome.tabs.discard(tab.id)
      } catch {
        // Tab may be undiscardable
      }
    }
  }
}

// --------------------------------------------------
// Duplicate Detection
// --------------------------------------------------

async function findDuplicates(): Promise<Map<string, chrome.tabs.Tab[]>> {
  const tabs = await chrome.tabs.query({})
  const urlMap = new Map<string, chrome.tabs.Tab[]>()

  for (const tab of tabs) {
    if (!tab.url || !isGroupableUrl(tab.url)) continue
    // Normalize URL (remove hash)
    const normalized = tab.url.split('#')[0]
    const existing = urlMap.get(normalized) ?? []
    existing.push(tab)
    urlMap.set(normalized, existing)
  }

  // Filter to only duplicates
  const duplicates = new Map<string, chrome.tabs.Tab[]>()
  for (const [url, tabList] of urlMap) {
    if (tabList.length > 1) {
      duplicates.set(url, tabList)
    }
  }

  return duplicates
}

async function closeDuplicates(): Promise<number> {
  const duplicates = await findDuplicates()
  let closed = 0

  for (const [, tabList] of duplicates) {
    // Keep the first (oldest), close the rest
    const toClose = tabList.slice(1)
    for (const tab of toClose) {
      if (tab.id) {
        try {
          await chrome.tabs.remove(tab.id)
          closed++
        } catch {
          // Tab may already be closed
        }
      }
    }
  }

  return closed
}

// --------------------------------------------------
// Close Inactive Tabs
// --------------------------------------------------

async function closeInactiveTabs(): Promise<number> {
  const settings = await loadSettings()
  const timeoutMs = (settings.suspendTimeout || 30) * 60 * 1000
  const now = Date.now()
  const tabs = await chrome.tabs.query({})
  let closed = 0

  for (const tab of tabs) {
    if (!tab.id || tab.active || tab.pinned) continue
    if (!tab.url || !isGroupableUrl(tab.url)) continue

    const lastActive = tabLastActive.get(tab.id) ?? tab.lastAccessed ?? 0
    if (now - lastActive > timeoutMs) {
      try {
        await chrome.tabs.remove(tab.id)
        closed++
      } catch {
        // ignore
      }
    }
  }

  return closed
}

// --------------------------------------------------
// Session Management
// --------------------------------------------------

async function saveSession(name: string): Promise<SavedSession> {
  const tabs = await chrome.tabs.query({ currentWindow: true })
  const groups = await chrome.tabGroups.query({ windowId: tabs[0]?.windowId })
  const groupMap = new Map<number, chrome.tabGroups.TabGroup>()
  for (const g of groups) {
    groupMap.set(g.id, g)
  }

  const session: SavedSession = {
    id: crypto.randomUUID(),
    name,
    createdAt: Date.now(),
    tabs: tabs
      .filter(t => t.url && isGroupableUrl(t.url))
      .map(t => {
        const group = t.groupId !== -1 ? groupMap.get(t.groupId) : undefined
        return {
          url: t.url!,
          title: t.title ?? '',
          groupName: group?.title,
          groupColor: group?.color,
        }
      }),
  }

  const sessions = (await storage.get<SavedSession[]>(STORAGE_KEYS.SAVED_SESSIONS, 'local')) ?? []
  sessions.push(session)
  await storage.set(STORAGE_KEYS.SAVED_SESSIONS, sessions, 'local')

  return session
}

async function restoreSession(sessionId: string): Promise<void> {
  const sessions = (await storage.get<SavedSession[]>(STORAGE_KEYS.SAVED_SESSIONS, 'local')) ?? []
  const session = sessions.find(s => s.id === sessionId)
  if (!session) return

  // Create a new window with all the tabs
  const win = await chrome.windows.create({ url: session.tabs[0]?.url })
  if (!win.id) return

  // Open remaining tabs
  for (let i = 1; i < session.tabs.length; i++) {
    await chrome.tabs.create({ url: session.tabs[i].url, windowId: win.id })
  }

  // Wait a moment then organize
  setTimeout(async () => {
    const settings = await loadSettings()
    await organizeWindow(win.id!, settings)
  }, 1000)
}

async function deleteSession(sessionId: string): Promise<void> {
  const sessions = (await storage.get<SavedSession[]>(STORAGE_KEYS.SAVED_SESSIONS, 'local')) ?? []
  const filtered = sessions.filter(s => s.id !== sessionId)
  await storage.set(STORAGE_KEYS.SAVED_SESSIONS, filtered, 'local')
}

async function getSessions(): Promise<SavedSession[]> {
  return (await storage.get<SavedSession[]>(STORAGE_KEYS.SAVED_SESSIONS, 'local')) ?? []
}

// --------------------------------------------------
// Get All Tabs Info
// --------------------------------------------------

async function getAllTabsInfo(): Promise<TabInfo[]> {
  const tabs = await chrome.tabs.query({})
  const duplicates = await findDuplicates()
  const duplicateUrls = new Set<string>()
  for (const [url] of duplicates) {
    duplicateUrls.add(url)
  }

  return tabs
    .filter(t => t.id !== undefined)
    .map(t => {
      const url = t.url ?? ''
      const domain = extractDomain(url)
      const normalizedUrl = url.split('#')[0]

      return {
        id: t.id!,
        windowId: t.windowId,
        url,
        title: t.title ?? '',
        favIconUrl: t.favIconUrl,
        domain,
        groupId: t.groupId ?? -1,
        lastActiveAt: tabLastActive.get(t.id!) ?? t.lastAccessed ?? Date.now(),
        createdAt: t.lastAccessed ?? Date.now(),
        isDiscarded: t.discarded ?? false,
        isDuplicate: duplicateUrls.has(normalizedUrl),
        memoryEstimateMB: t.discarded ? DISCARDED_TAB_MEMORY_MB : AVG_TAB_MEMORY_MB,
      }
    })
}

async function getTabStats(): Promise<TabStats> {
  const tabs = await getAllTabsInfo()
  const discardedCount = tabs.filter(t => t.isDiscarded).length
  const activeCount = tabs.length - discardedCount

  const totalMemory = activeCount * AVG_TAB_MEMORY_MB + discardedCount * DISCARDED_TAB_MEMORY_MB
  const memorySaved = discardedCount * (AVG_TAB_MEMORY_MB - DISCARDED_TAB_MEMORY_MB)

  return {
    totalTabs: tabs.length,
    groupedTabs: tabs.filter(t => t.groupId !== -1).length,
    duplicateTabs: tabs.filter(t => t.isDuplicate).length,
    discardedTabs: discardedCount,
    memorySavedMB: memorySaved,
    totalMemoryMB: totalMemory,
  }
}

// --------------------------------------------------
// Tab Event Listeners
// --------------------------------------------------

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.id) {
    markTabActive(tab.id)
  }
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  markTabActive(tabId)

  if (changeInfo.url && tab.url) {
    await recordTabVisit(tabId, tab.url)
  }

  // Auto-organize when a tab finishes loading
  if (changeInfo.status === 'complete' && tab.url && isGroupableUrl(tab.url)) {
    const settings = await loadSettings()
    if (settings.autoOrganize && tab.windowId !== undefined) {
      // Small delay to batch rapid updates
      setTimeout(() => organizeWindow(tab.windowId, settings), 500)
    }
  }
})

chrome.tabs.onActivated.addListener(({ tabId }) => {
  markTabActive(tabId)
})

chrome.tabs.onRemoved.addListener((tabId) => {
  tabLastActive.delete(tabId)
})

// Persist last-active data periodically
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARMS.SUSPEND_CHECK) {
    await checkAndSuspendTabs()
    await persistLastActive()
  }
  if (alarm.name === ALARMS.STATS_UPDATE) {
    await persistLastActive()
  }
})

// --------------------------------------------------
// Message Handler (popup ↔ background)
// --------------------------------------------------

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse: (response: ExtensionResponse) => void) => {
    handleMessage(message).then(sendResponse).catch(err => {
      sendResponse({ success: false, error: String(err) })
    })
    return true // Keep channel open for async response
  }
)

async function handleMessage(message: ExtensionMessage): Promise<ExtensionResponse> {
  switch (message.type) {
    case 'PING':
      return { success: true, data: 'pong' }

    case 'GET_TABS':
      return { success: true, data: await getAllTabsInfo() }

    case 'GET_STATS':
      return { success: true, data: await getTabStats() }

    case 'ORGANIZE_NOW':
      await organizeAllTabs()
      return { success: true }

    case 'CLOSE_DUPLICATES': {
      const closed = await closeDuplicates()
      return { success: true, data: closed }
    }

    case 'CLOSE_INACTIVE': {
      const closed = await closeInactiveTabs()
      return { success: true, data: closed }
    }

    case 'SAVE_SESSION': {
      const name = (message.payload as { name: string })?.name ?? `Session ${new Date().toLocaleString()}`
      const session = await saveSession(name)
      return { success: true, data: session }
    }

    case 'RESTORE_SESSION': {
      const sessionId = (message.payload as { id: string })?.id
      if (!sessionId) return { success: false, error: 'No session ID' }
      await restoreSession(sessionId)
      return { success: true }
    }

    case 'DELETE_SESSION': {
      const sid = (message.payload as { id: string })?.id
      if (!sid) return { success: false, error: 'No session ID' }
      await deleteSession(sid)
      return { success: true }
    }

    case 'GET_SESSIONS':
      return { success: true, data: await getSessions() }

    case 'SWITCH_TO_TAB': {
      const tabId = (message.payload as { tabId: number })?.tabId
      if (!tabId) return { success: false, error: 'No tab ID' }
      try {
        const tab = await chrome.tabs.update(tabId, { active: true })
        if (tab?.windowId) {
          await chrome.windows.update(tab.windowId, { focused: true })
        }
        return { success: true }
      } catch {
        return { success: false, error: 'Tab not found' }
      }
    }

    case 'CLOSE_TAB': {
      const tid = (message.payload as { tabId: number })?.tabId
      if (!tid) return { success: false, error: 'No tab ID' }
      try {
        await chrome.tabs.remove(tid)
        return { success: true }
      } catch {
        return { success: false, error: 'Failed to close tab' }
      }
    }

    case 'GET_SETTINGS':
      return { success: true, data: await loadSettings() }

    case 'UPDATE_SETTINGS': {
      const newSettings = message.payload as Partial<Settings>
      const current = await loadSettings()
      const merged = { ...current, ...newSettings }
      await storage.set(STORAGE_KEYS.SETTINGS, merged)
      cachedSettings = merged
      return { success: true, data: merged }
    }

    case 'OPEN_OPTIONS':
      chrome.runtime.openOptionsPage()
      return { success: true }

    default:
      return { success: false, error: `Unknown message type: ${message.type}` }
  }
}

// --------------------------------------------------
// Initialization
// --------------------------------------------------

async function init(): Promise<void> {
  await loadSettings()
  await loadLastActive()

  // Set up alarms
  await chrome.alarms.create(ALARMS.SUSPEND_CHECK, { periodInMinutes: 5 })
  await chrome.alarms.create(ALARMS.STATS_UPDATE, { periodInMinutes: 10 })

  // Mark all currently active tabs
  const tabs = await chrome.tabs.query({ active: true })
  for (const tab of tabs) {
    if (tab.id) markTabActive(tab.id)
  }

  console.log('[TabFlow AI] Background service worker initialized')
}

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default settings on first install
    await storage.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
    console.log('[TabFlow AI] Extension installed — defaults applied')
  }
  await init()
})

chrome.runtime.onStartup.addListener(init)

// Also init immediately (for when service worker restarts)
init()
