import { NextResponse } from 'next/server'
import { events } from '@/lib/data/mock'

export async function GET() {
  return NextResponse.json(events)
}