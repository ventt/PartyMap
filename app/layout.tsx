import type { Metadata } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import TopBar from '@/components/TopBar'
import BottomBar from '@/components/BottomBar'

export const metadata: Metadata = {
  title: 'PartyMap',
  description: 'Find parties on the map — places, events, performers',
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 1 },
  themeColor: '#7c3aed', // violet
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh antialiased bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <ThemeProvider>
        <TopBar />
        <div className="pt-16 pb-16 md:pb-0">{children}</div>
        <BottomBar />
      </ThemeProvider>
    </body>
    </html>
  )
}
