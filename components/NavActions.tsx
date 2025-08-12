'use client'
import type React from 'react'
import Link from 'next/link'
import { MapPinned, Ticket, User } from 'lucide-react'

export default function NavActions({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const items = [
    { key: 'nearby', href: '#', label: 'Nearby', Icon: MapPinned },
    { key: 'tickets', href: '#', label: 'Tickets', Icon: Ticket },
    { key: 'profile', href: '#', label: 'Profile', Icon: User },
  ]

  const onNearbyClick = (e: React.MouseEvent) => {
    e.preventDefault()
    try { window.dispatchEvent(new CustomEvent('pm:nearby')) } catch {}
  }

  if (variant === 'mobile') {
    return (
      <div className="grid w-full grid-cols-3">
        {items.map(({ key, href, label, Icon }) => (
          key === 'nearby' ? (
            <button
              key={key}
              type="button"
              onClick={onNearbyClick}
              className="flex flex-col items-center justify-center gap-1 text-xs opacity-95"
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          ) : (
            <Link
              key={key}
              href={href}
              className="flex flex-col items-center justify-center gap-1 text-xs opacity-95"
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          )
        ))}
      </div>
    )
  }

  // desktop
  return (
    <nav className="flex items-center gap-1">
      {items.map(({ key, href, label, Icon }) => (
        key === 'nearby' ? (
          <button
            key={key}
            type="button"
            onClick={onNearbyClick}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white/95 hover:text-white hover:bg-white/10 transition"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ) : (
          <Link
            key={key}
            href={href}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm
                     text-white/95 hover:text-white hover:bg-white/10 transition"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        )
      ))}
    </nav>
  )
}
