import type { TabInfo } from '@/lib/types'

interface TabItemProps {
  tab: TabInfo
  onSwitch: (tabId: number) => void
  onClose: (tabId: number) => void
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max - 1) + '…'
}

export function TabItem({ tab, onSwitch, onClose }: TabItemProps) {
  return (
    <div
      className="group flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors animate-fade-in"
      style={{ borderBottom: '1px solid var(--border-color)' }}
      onClick={() => onSwitch(tab.id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-secondary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {/* Favicon */}
      <div className="flex-shrink-0 w-4 h-4 relative">
        {tab.favIconUrl ? (
          <img
            src={tab.favIconUrl}
            alt=""
            className="w-4 h-4 rounded-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div
            className="w-4 h-4 rounded-sm flex items-center justify-center text-[9px] font-bold"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            {tab.domain.charAt(0).toUpperCase()}
          </div>
        )}
        {tab.isDiscarded && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
            style={{ background: 'var(--text-tertiary)' }}
            title="Suspended"
          />
        )}
      </div>

      {/* Title + Domain */}
      <div className="flex-1 min-w-0">
        <div
          className="text-xs leading-tight font-medium truncate"
          style={{
            color: tab.isDiscarded ? 'var(--text-tertiary)' : 'var(--text-primary)',
          }}
          title={tab.title}
        >
          {truncate(tab.title || 'Untitled', 50)}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className="text-[10px] truncate"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {tab.domain}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            · {timeAgo(tab.lastActiveAt)}
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {tab.isDuplicate && (
          <span
            className="text-[9px] px-1 py-0.5 rounded font-medium"
            style={{ background: 'var(--warning)', color: '#fff' }}
          >
            DUPE
          </span>
        )}
      </div>

      {/* Close button */}
      <button
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity"
        style={{ color: 'var(--text-tertiary)' }}
        onClick={(e) => {
          e.stopPropagation()
          onClose(tab.id)
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--danger)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-tertiary)'
        }}
        title="Close tab"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
