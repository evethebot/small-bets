import type { TabStats } from '@/lib/types'

interface StatsBarProps {
  stats: TabStats | null
}

function formatMemory(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)}GB`
  return `${mb}MB`
}

export function StatsBar({ stats }: StatsBarProps) {
  if (!stats) return null

  return (
    <div
      className="flex items-center justify-between px-3 py-1.5 text-xs"
      style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
    >
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          {stats.totalTabs} tabs
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {stats.groupedTabs} grouped
        </span>
        {stats.duplicateTabs > 0 && (
          <span className="flex items-center gap-1" style={{ color: 'var(--warning)' }}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {stats.duplicateTabs} dupes
          </span>
        )}
      </div>
      {stats.memorySavedMB > 0 && (
        <span className="flex items-center gap-1 font-medium" style={{ color: 'var(--success)' }}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Saving {formatMemory(stats.memorySavedMB)}
        </span>
      )}
    </div>
  )
}
