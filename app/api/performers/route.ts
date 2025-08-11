import { NextResponse } from 'next/server'
import { performers } from '@/lib/data/mock'

export async function GET() {
  return NextResponse.json(performers)
}