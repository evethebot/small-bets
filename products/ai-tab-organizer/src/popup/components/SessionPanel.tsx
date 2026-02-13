import { useState, useEffect, useCallback } from 'react'
import type { SavedSession } from '@/lib/types'
import { useSendMessage } from '../hooks/useMessages'

interface SessionPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SessionPanel({ isOpen, onClose }: SessionPanelProps) {
  const send = useSendMessage()
  const [sessions, setSessions] = useState<SavedSession[]>([])
  const [sessionName, setSessionName] = useState('')
  const [saving, setSaving] = useState(false)

  const loadSessions = useCallback(async () => {
    const res = await send<SavedSession[]>('GET_SESSIONS')
    if (res.success && res.data) {
      setSessions(res.data)
    }
  }, [send])

  useEffect(() => {
    if (isOpen) loadSessions()
  }, [isOpen, loadSessions])

  const handleSave = async () => {
    if (!sessionName.trim()) return
    setSaving(true)
    await send('SAVE_SESSION', { name: sessionName.trim() })
    setSessionName('')
    setSaving(false)
    await loadSessions()
  }

  const handleRestore = async (id: string) => {
    await send('RESTORE_SESSION', { id })
  }

  const handleDelete = async (id: string) => {
    await send('DELETE_SESSION', { id })
    await loadSessions()
  }

  if (!isOpen) return null

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col animate-fade-in"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Saved Sessions
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Save new session */}
      <div className="flex gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <input
          type="text"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="Session name..."
          className="flex-1 px-2 py-1.5 text-xs rounded outline-none"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          onClick={handleSave}
          disabled={!sessionName.trim() || saving}
          className="px-3 py-1.5 text-xs font-medium rounded"
          style={{
            background: sessionName.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: sessionName.trim() ? '#fff' : 'var(--text-tertiary)',
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8" style={{ color: 'var(--text-tertiary)' }}>
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
            </svg>
            <span className="text-xs">No saved sessions</span>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-2 px-3 py-2"
              style={{ borderBottom: '1px solid var(--border-color)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {session.name}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  {session.tabs.length} tabs · {new Date(session.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => handleRestore(session.id)}
                className="px-2 py-1 text-[10px] font-medium rounded"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                Restore
              </button>
              <button
                onClick={() => handleDelete(session.id)}
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
