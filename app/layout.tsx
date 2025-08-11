import type { Metadata } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import TopBar from '@/components/TopBar'
import BottomBar from '@/components/BottomBar'

export const metadata: Metadata = {
  title: 'PartyMap',
  description: 'Find parties on the map — places, events, performers',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#7c3aed',

}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh antialiased bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <ThemeProvider>
          {/* Floating bars (no layout padding reserved) */}
          <TopBar />
          <BottomBar />
          {/* Map fills the whole viewport; bars simply overlay */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
