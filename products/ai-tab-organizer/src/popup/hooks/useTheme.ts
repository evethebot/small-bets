import { useState, useEffect, useCallback } from 'react'
import type { Theme } from '@/lib/types'

export function useTheme(theme: Theme = 'system') {
  const [isDark, setIsDark] = useState(false)

  const applyTheme = useCallback((t: Theme) => {
    let dark = false
    if (t === 'dark') {
      dark = true
    } else if (t === 'system') {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  useEffect(() => {
    applyTheme(theme)

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme, applyTheme])

  return isDark
}
