interface ActionBarProps {
  onOrganize: () => void
  onCloseDuplicates: () => void
  onCloseInactive: () => void
  onSaveSession: () => void
  onOpenSettings: () => void
  isOrganizing: boolean
  duplicateCount: number
}

export function ActionBar({
  onOrganize,
  onCloseDuplicates,
  onCloseInactive,
  onSaveSession,
  onOpenSettings,
  isOrganizing,
  duplicateCount,
}: ActionBarProps) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-2"
      style={{ borderTop: '1px solid var(--border-color)' }}
    >
      {/* Organize Now */}
      <button
        onClick={onOrganize}
        disabled={isOrganizing}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all"
        style={{
          background: 'var(--accent)',
          color: '#fff',
          opacity: isOrganizing ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isOrganizing) e.currentTarget.style.background = 'var(--accent-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--accent)'
        }}
      >
        {isOrganizing ? (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        )}
        {isOrganizing ? 'Organizing…' : 'Organize'}
      </button>

      {/* Close Duplicates */}
      {duplicateCount > 0 && (
        <button
          onClick={onCloseDuplicates}
          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs transition-colors"
          style={{
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-tertiary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-secondary)'
          }}
          title={`Close ${duplicateCount} duplicate tabs`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2" />
          </svg>
          Dupes ({duplicateCount})
        </button>
      )}

      {/* Close Inactive */}
      <button
        onClick={onCloseInactive}
        className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs transition-colors"
        style={{
          background: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-color)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-tertiary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-secondary)'
        }}
        title="Close inactive tabs"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Inactive
      </button>

      <div className="flex-1" />

      {/* Save Session */}
      <button
        onClick={onSaveSession}
        className="p-1.5 rounded-md transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--accent)'
          e.currentTarget.style.background = 'var(--accent-light)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)'
          e.currentTarget.style.background = 'transparent'
        }}
        title="Save current session"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      </button>

      {/* Settings */}
      <button
        onClick={onOpenSettings}
        className="p-1.5 rounded-md transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--accent)'
          e.currentTarget.style.background = 'var(--accent-light)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)'
          e.currentTarget.style.background = 'transparent'
        }}
        title="Settings"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  )
}
