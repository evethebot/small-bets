import { useState, useEffect, useCallback } from 'react'
import type { Settings, Theme, DomainGroupRule } from '@/lib/types'
import { DEFAULT_SETTINGS } from '@/lib/types'
import { GROUP_COLORS } from '@/lib/constants'
import { useSendMessage } from '../popup/hooks/useMessages'
import { useTheme } from '../popup/hooks/useTheme'

// --------------------------------------------------
// Sub-components
// --------------------------------------------------

function Toggle({ checked, onChange, label, description }: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <label className="flex items-center justify-between py-3 cursor-pointer">
      <div>
        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</div>
        {description && (
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{description}</div>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-10 h-5.5 rounded-full transition-colors"
        style={{
          background: checked ? 'var(--accent)' : 'var(--bg-tertiary)',
          border: checked ? 'none' : '1px solid var(--border-color)',
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform"
          style={{
            transform: checked ? 'translateX(18px)' : 'translateX(0)',
          }}
        />
      </button>
    </label>
  )
}

function Select<T extends string>({ value, onChange, label, description, options }: {
  value: T
  onChange: (v: T) => void
  label: string
  description?: string
  options: Array<{ value: T; label: string }>
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</div>
        {description && (
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{description}</div>
        )}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="px-3 py-1.5 text-sm rounded-lg outline-none cursor-pointer"
        style={{
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5 mb-4 animate-fade-in"
      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
    >
      <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h2>
      <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
        {children}
      </div>
    </div>
  )
}

// --------------------------------------------------
// Custom Rules Editor
// --------------------------------------------------

function CustomRulesEditor({ rules, onChange }: {
  rules: DomainGroupRule[]
  onChange: (rules: DomainGroupRule[]) => void
}) {
  const [newPattern, setNewPattern] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [newColor, setNewColor] = useState<chrome.tabGroups.ColorEnum>('blue')

  const addRule = () => {
    if (!newPattern.trim() || !newGroupName.trim()) return
    onChange([...rules, { pattern: newPattern.trim(), groupName: newGroupName.trim(), color: newColor }])
    setNewPattern('')
    setNewGroupName('')
  }

  const removeRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index))
  }

  return (
    <div className="py-3">
      <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        Custom Group Rules
      </div>
      <div className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
        Map domain patterns to custom group names
      </div>

      {/* Existing rules */}
      {rules.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {rules.map((rule, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <code className="flex-1 font-mono" style={{ color: 'var(--text-primary)' }}>{rule.pattern}</code>
              <span style={{ color: 'var(--text-tertiary)' }}>→</span>
              <span className="font-medium" style={{ color: 'var(--accent)' }}>{rule.groupName}</span>
              {rule.color && (
                <span className={`w-3 h-3 rounded-full group-dot-${rule.color}`} />
              )}
              <button
                onClick={() => removeRule(i)}
                className="p-0.5 rounded hover:opacity-80"
                style={{ color: 'var(--danger)' }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new rule */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newPattern}
          onChange={(e) => setNewPattern(e.target.value)}
          placeholder="domain pattern"
          className="flex-1 px-2 py-1.5 text-xs rounded outline-none font-mono"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="group name"
          className="flex-1 px-2 py-1.5 text-xs rounded outline-none"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />
        <select
          value={newColor}
          onChange={(e) => setNewColor(e.target.value as chrome.tabGroups.ColorEnum)}
          className="px-2 py-1.5 text-xs rounded outline-none"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          {GROUP_COLORS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={addRule}
          disabled={!newPattern.trim() || !newGroupName.trim()}
          className="px-3 py-1.5 text-xs font-medium rounded"
          style={{
            background: (newPattern.trim() && newGroupName.trim()) ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: (newPattern.trim() && newGroupName.trim()) ? '#fff' : 'var(--text-tertiary)',
          }}
        >
          Add
        </button>
      </div>
    </div>
  )
}

// --------------------------------------------------
// Excluded Sites Editor
// --------------------------------------------------

function ExcludedSitesEditor({ sites, onChange }: {
  sites: string[]
  onChange: (sites: string[]) => void
}) {
  const [newSite, setNewSite] = useState('')

  const addSite = () => {
    if (!newSite.trim()) return
    if (sites.includes(newSite.trim())) return
    onChange([...sites, newSite.trim()])
    setNewSite('')
  }

  return (
    <div className="py-3">
      <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        Excluded Sites
      </div>
      <div className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
        These sites will never be suspended or auto-grouped
      </div>

      {sites.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {sites.map((site, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              {site}
              <button
                onClick={() => onChange(sites.filter((_, idx) => idx !== i))}
                className="hover:opacity-80"
                style={{ color: 'var(--danger)' }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={newSite}
          onChange={(e) => setNewSite(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSite()}
          placeholder="e.g. google.com"
          className="flex-1 px-2 py-1.5 text-xs rounded outline-none"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          onClick={addSite}
          disabled={!newSite.trim()}
          className="px-3 py-1.5 text-xs font-medium rounded"
          style={{
            background: newSite.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: newSite.trim() ? '#fff' : 'var(--text-tertiary)',
          }}
        >
          Add
        </button>
      </div>
    </div>
  )
}

// --------------------------------------------------
// Main Options App
// --------------------------------------------------

export function OptionsApp() {
  const send = useSendMessage()
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useTheme(settings.theme)

  const loadSettings = useCallback(async () => {
    const res = await send<Settings>('GET_SETTINGS')
    if (res.success && res.data) {
      setSettings({ ...DEFAULT_SETTINGS, ...res.data })
    }
    setLoaded(true)
  }, [send])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const saveSettings = useCallback(async (newSettings: Partial<Settings>) => {
    const merged = { ...settings, ...newSettings }
    setSettings(merged)
    await send('UPDATE_SETTINGS', merged)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [settings, send])

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tabflow-ai-settings.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importSettings = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const imported = JSON.parse(text) as Settings
        await saveSettings(imported)
      } catch {
        alert('Invalid settings file')
      }
    }
    input.click()
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--accent)' }}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>TabFlow AI Settings</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Configure how your tabs are organized and managed
          </p>
        </div>
        {saved && (
          <span
            className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium animate-fade-in"
            style={{ background: 'var(--success)', color: '#fff' }}
          >
            ✓ Saved
          </span>
        )}
      </div>

      {/* General */}
      <Section title="General">
        <Toggle
          label="Auto-organize tabs"
          description="Automatically group new tabs by domain and topic"
          checked={settings.autoOrganize}
          onChange={(v) => saveSettings({ autoOrganize: v })}
        />
        <Select
          label="Suspend timeout"
          description="Automatically suspend inactive tabs to save memory"
          value={String(settings.suspendTimeout) as '15' | '30' | '60' | '0'}
          onChange={(v) => saveSettings({ suspendTimeout: Number(v) as 15 | 30 | 60 | 0 })}
          options={[
            { value: '15', label: '15 minutes' },
            { value: '30', label: '30 minutes' },
            { value: '60', label: '1 hour' },
            { value: '0', label: 'Never' },
          ]}
        />
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <Select
          label="Theme"
          description="Choose your preferred color scheme"
          value={settings.theme}
          onChange={(v) => saveSettings({ theme: v as Theme })}
          options={[
            { value: 'system', label: 'System' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
      </Section>

      {/* Custom Rules */}
      <Section title="Organization Rules">
        <CustomRulesEditor
          rules={settings.customRules}
          onChange={(rules) => saveSettings({ customRules: rules })}
        />
        <ExcludedSitesEditor
          sites={settings.excludedSites}
          onChange={(sites) => saveSettings({ excludedSites: sites })}
        />
      </Section>

      {/* Data */}
      <Section title="Data">
        <div className="flex items-center justify-between py-3">
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Export settings</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Download your settings as a JSON file
            </div>
          </div>
          <button
            onClick={exportSettings}
            className="px-3 py-1.5 text-xs font-medium rounded-lg"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
          >
            Export
          </button>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Import settings</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Restore settings from a JSON file
            </div>
          </div>
          <button
            onClick={importSettings}
            className="px-3 py-1.5 text-xs font-medium rounded-lg"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
          >
            Import
          </button>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Reset to defaults</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Restore all settings to their default values
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm('Reset all settings to defaults?')) {
                saveSettings(DEFAULT_SETTINGS)
              }
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg"
            style={{ background: 'var(--danger)', color: '#fff' }}
          >
            Reset
          </button>
        </div>
      </Section>

      {/* About */}
      <Section title="About">
        <div className="py-3">
          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>TabFlow AI</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Version 0.1.0
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            AI-powered tab organizer that automatically groups, saves memory, and finds any tab instantly
          </div>
        </div>
      </Section>

      {/* Keyboard shortcuts */}
      <Section title="Keyboard Shortcuts">
        <div className="py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Open search</span>
            <kbd
              className="px-2 py-0.5 text-xs rounded font-mono"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
            >
              {navigator.platform.includes('Mac') ? '⌘⇧F' : 'Ctrl+Shift+F'}
            </kbd>
          </div>
        </div>
      </Section>
    </div>
  )
}
