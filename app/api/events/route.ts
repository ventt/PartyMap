import { NextResponse } from 'next/server'
import { getDataSource, createRepositories } from '@/lib/dataSource'

export async function GET() {
  try {
    const ds = getDataSource()
    const { events } = createRepositories(ds)
    const all = await events.all()
    return NextResponse.json(all)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}