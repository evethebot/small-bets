import { useState } from 'react'
import type { TabInfo } from '@/lib/types'
import { TabItem } from './TabItem'

interface TabGroupSectionProps {
  title: string
  color?: string
  tabs: TabInfo[]
  onSwitchTab: (tabId: number) => void
  onCloseTab: (tabId: number) => void
  defaultExpanded?: boolean
}

export function TabGroupSection({
  title,
  color,
  tabs,
  onSwitchTab,
  onCloseTab,
  defaultExpanded = true,
}: TabGroupSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="animate-fade-in">
      {/* Group header */}
      <button
        className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left"
        style={{ background: 'var(--bg-secondary)' }}
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-tertiary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-secondary)'
        }}
      >
        {/* Expand/collapse chevron */}
        <svg
          className="w-3 h-3 transition-transform flex-shrink-0"
          style={{
            color: 'var(--text-secondary)',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>

        {/* Color dot */}
        {color && (
          <div
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 group-dot-${color}`}
          />
        )}

        {/* Group name */}
        <span
          className="text-xs font-semibold flex-1 truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </span>

        {/* Tab count badge */}
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
          }}
        >
          {tabs.length}
        </span>
      </button>

      {/* Tab list */}
      {expanded && (
        <div className="animate-slide-down">
          {tabs.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              onSwitch={onSwitchTab}
              onClose={onCloseTab}
            />
          ))}
        </div>
      )}
    </div>
  )
}
