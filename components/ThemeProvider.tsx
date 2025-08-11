'use client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'light' | 'dark'
type Ctx = { theme: Theme; toggle: () => void }
const ThemeCtx = createContext<Ctx | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  // load saved / system-pref
  useEffect(() => {
    const saved = (localStorage.getItem('theme') as Theme | null)
    if (saved) setTheme(saved)
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark')
  }, [])

  // reflect on <html> class
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const value = useMemo(() => ({ theme, toggle: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')) }), [theme])
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
