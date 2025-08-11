import Image from 'next/image'
import Link from 'next/link'
import { getDataSource } from '@/lib/dataSource'
import { notFound } from 'next/navigation'
import EventCard from '@/components/EventCard'

export const revalidate = 60

export default async function PlacePage({ params }: { params: { id: string } }) {
  const ds = getDataSource()
  const place = await ds.getPlace(params.id)
  if (!place) return notFound()
  const events = (await ds.getEvents()).filter(e => e.placeId === place.id)

  return (
    <main className="p-4 pb-8 safe-bottom">
      <Link href="/" className="text-sm text-sky-600">← Back</Link>
      <div className="mt-2 overflow-hidden rounded-2xl border border-gray-200">
        <Image src={place.image} alt={place.name} width={1600} height={900} className="h-56 w-full object-cover"/>
        <div className="p-4">
          <h1 className="text-2xl font-bold">{place.name}</h1>
          <p className="text-sm text-gray-600">{place.address}, {place.city}</p>
          <p className="mt-2 text-sm">{place.description}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {place.tags.map(t => <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{t}</span>)}
          </div>
        </div>
      </div>

      <section className="mt-4">
        <h2 className="mb-2 text-lg font-semibold">Upcoming events</h2>
        <div className="grid grid-cols-1 gap-3">
          {events.length === 0 && <p className="text-sm text-gray-600">No events yet.</p>}
          {events.map(e => <EventCard key={e.id} event={e} place={place} />)}
        </div>
      </section>
    </main>
  )
}