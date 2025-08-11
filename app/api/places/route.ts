import { NextResponse } from 'next/server'
import { places } from '@/lib/data/mock'

export async function GET() {
  return NextResponse.json(places)
}