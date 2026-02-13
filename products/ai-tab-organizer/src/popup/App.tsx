import { useState, useEffect, useCallback, useMemo } from 'react'
import type { TabInfo, TabStats, Settings } from '@/lib/types'
import { useSendMessage } from './hooks/useMessages'
import { useTheme } from './hooks/useTheme'
import { SearchBar } from './components/SearchBar'
import { StatsBar } from './components/StatsBar'
import { TabGroupSection } from './components/TabGroupSection'
import { TabItem } from './components/TabItem'
import { ActionBar } from './components/ActionBar'
import { SessionPanel } from './components/SessionPanel'

// --------------------------------------------------
// Fuzzy search helper
// --------------------------------------------------

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase()
  const t = text.toLowerCase()

  // Simple substring match + character sequence match
  if (t.includes(q)) return true

  // Fuzzy: all chars of query appear in order in text
  let qi = 0
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++
  }
  return qi === q.length
}

// (grouping logic is inline in the displayGroups useMemo below)

// --------------------------------------------------
// App
// --------------------------------------------------

export function App() {
  const send = useSendMessage()
  const [tabs, setTabs] = useState<TabInfo[]>([])
  const [stats, setStats] = useState<TabStats | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isOrganizing, setIsOrganizing] = useState(false)
  const [showSessions, setShowSessions] = useState(false)
  const [groupNames, setGroupNames] = useState<Map<number, { title: string; color: string }>>(new Map())

  useTheme(settings?.theme ?? 'system')

  // --------------------------------------------------
  // Data fetching
  // --------------------------------------------------

  const loadData = useCallback(async () => {
    const [tabsRes, statsRes, settingsRes] = await Promise.all([
      send<TabInfo[]>('GET_TABS'),
      send<TabStats>('GET_STATS'),
      send<Settings>('GET_SETTINGS'),
    ])

    if (tabsRes.success && tabsRes.data) setTabs(tabsRes.data)
    if (statsRes.success && statsRes.data) setStats(statsRes.data)
    if (settingsRes.success && settingsRes.data) setSettings(settingsRes.data)

    // Load actual group names from Chrome API
    try {
      const groups = await chrome.tabGroups.query({})
      const map = new Map<number, { title: string; color: string }>()
      for (const g of groups) {
        map.set(g.id, { title: g.title || 'Unnamed', color: g.color })
      }
      setGroupNames(map)
    } catch {
      // TabGroups API may not be available in all contexts
    }
  }, [send])

  useEffect(() => {
    loadData()
  }, [loadData])

  // --------------------------------------------------
  // Search + filtering
  // --------------------------------------------------

  const filteredTabs = useMemo(() => {
    if (!searchQuery.trim()) return tabs
    return tabs.filter(tab =>
      fuzzyMatch(searchQuery, `${tab.title} ${tab.url} ${tab.domain}`)
    )
  }, [tabs, searchQuery])

  const isSearching = searchQuery.trim().length > 0

  // --------------------------------------------------
  // Build display groups
  // --------------------------------------------------

  const displayGroups = useMemo(() => {
    if (isSearching) return null // Show flat list when searching

    const byGroupId = new Map<number, TabInfo[]>()
    const ungrouped: TabInfo[] = []

    for (const tab of filteredTabs) {
      if (tab.groupId !== -1) {
        const list = byGroupId.get(tab.groupId) ?? []
        list.push(tab)
        byGroupId.set(tab.groupId, list)
      } else {
        ungrouped.push(tab)
      }
    }

    const groups: Array<{ key: string; title: string; color: string; tabs: TabInfo[] }> = []

    for (const [groupId, groupTabs] of byGroupId) {
      const info = groupNames.get(groupId)
      groups.push({
        key: `group-${groupId}`,
        title: info?.title ?? groupTabs[0]?.domain ?? 'Group',
        color: info?.color ?? 'blue',
        tabs: groupTabs.sort((a, b) => b.lastActiveAt - a.lastActiveAt),
      })
    }

    // Sort groups by tab count (largest first)
    groups.sort((a, b) => b.tabs.length - a.tabs.length)

    return { groups, ungrouped: ungrouped.sort((a, b) => b.lastActiveAt - a.lastActiveAt) }
  }, [filteredTabs, isSearching, groupNames])

  // --------------------------------------------------
  // Actions
  // --------------------------------------------------

  const handleOrganize = async () => {
    setIsOrganizing(true)
    await send('ORGANIZE_NOW')
    // Reload after a brief delay to allow grouping to complete
    setTimeout(async () => {
      await loadData()
      setIsOrganizing(false)
    }, 800)
  }

  const handleCloseDuplicates = async () => {
    await send('CLOSE_DUPLICATES')
    await loadData()
  }

  const handleCloseInactive = async () => {
    await send('CLOSE_INACTIVE')
    await loadData()
  }

  const handleSwitchTab = async (tabId: number) => {
    await send('SWITCH_TO_TAB', { tabId })
    window.close() // Close popup after switching
  }

  const handleCloseTab = async (tabId: number) => {
    await send('CLOSE_TAB', { tabId })
    setTabs(prev => prev.filter(t => t.id !== tabId))
  }

  const handleOpenSettings = () => {
    chrome.runtime.openOptionsPage()
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="flex flex-col" style={{ width: '400px', maxHeight: '600px' }}>
      {/* Header */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            TabFlow AI
          </h1>
        </div>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          tabCount={tabs.length}
        />
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Tab list */}
      <div
        className="flex-1 overflow-y-auto relative"
        style={{ maxHeight: '400px' }}
      >
        {filteredTabs.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">
              {isSearching ? 'No matching tabs' : 'No open tabs'}
            </span>
          </div>
        ) : isSearching ? (
          // Flat list when searching
          <div>
            {filteredTabs
              .sort((a, b) => b.lastActiveAt - a.lastActiveAt)
              .map((tab) => (
                <TabItem
                  key={tab.id}
                  tab={tab}
                  onSwitch={handleSwitchTab}
                  onClose={handleCloseTab}
                />
              ))}
          </div>
        ) : displayGroups ? (
          // Grouped view
          <div>
            {displayGroups.groups.map((group) => (
              <TabGroupSection
                key={group.key}
                title={group.title}
                color={group.color}
                tabs={group.tabs}
                onSwitchTab={handleSwitchTab}
                onCloseTab={handleCloseTab}
              />
            ))}
            {displayGroups.ungrouped.length > 0 && (
              <TabGroupSection
                key="ungrouped"
                title="Ungrouped"
                color="grey"
                tabs={displayGroups.ungrouped}
                onSwitchTab={handleSwitchTab}
                onCloseTab={handleCloseTab}
                defaultExpanded={displayGroups.groups.length === 0}
              />
            )}
          </div>
        ) : null}

        {/* Session panel overlay */}
        <SessionPanel isOpen={showSessions} onClose={() => setShowSessions(false)} />
      </div>

      {/* Action bar */}
      <ActionBar
        onOrganize={handleOrganize}
        onCloseDuplicates={handleCloseDuplicates}
        onCloseInactive={handleCloseInactive}
        onSaveSession={() => setShowSessions(true)}
        onOpenSettings={handleOpenSettings}
        isOrganizing={isOrganizing}
        duplicateCount={stats?.duplicateTabs ?? 0}
      />
    </div>
  )
}
