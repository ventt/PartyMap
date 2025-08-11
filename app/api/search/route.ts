import { NextResponse } from 'next/server'
import { searchAll } from '@/lib/search'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const hits = searchAll(q)
  return NextResponse.json({ query: q, hits })
}