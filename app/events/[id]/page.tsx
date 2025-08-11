import Image from 'next/image'
import Link from 'next/link'
import { getDataSource } from '@/lib/dataSource'
import { notFound } from 'next/navigation'
import { fmtRange } from '@/lib/time'

export const revalidate = 60

export default async function EventPage({ params }: { params: { id: string } }) {
  const ds = getDataSource()
  const event = await ds.getEvent(params.id)
  if (!event) return notFound()
  const place = await ds.getPlace(event.placeId)
  const performers = await Promise.all(event.performerIds.map(id => ds.getPerformer(id)))

  return (
    <main className="p-4 pb-8 safe-bottom">
      <Link href="/" className="text-sm text-sky-600">← Back</Link>
      <div className="mt-2 overflow-hidden rounded-2xl border border-gray-200">
        <Image src={event.image} alt={event.title} width={1600} height={900} className="h-56 w-full object-cover"/>
        <div className="p-4">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-sm text-gray-600">{fmtRange(event.start, event.end)}</p>
          {place && (
            <p className="text-sm text-gray-600">
              at <Link href={`/places/${place.id}`} className="text-sky-600 hover:underline">{place.name}</Link>
            </p>
          )}
          {event.price && <p className="mt-1 text-sm">Price: {event.price}</p>}
          <p className="mt-2 text-sm">{event.description}</p>
        </div>
      </div>

      <section className="mt-4">
        <h2 className="mb-2 text-lg font-semibold">Performers</h2>
        <ul className="grid grid-cols-1 gap-3">
          {performers.filter(Boolean).map(p => (
            <li key={p!.id} className="rounded-2xl border border-gray-200 p-4">
              <Link href={`/performers/${p!.id}`} className="text-sky-600 hover:underline font-medium">{p!.name}</Link>
              <div className="text-sm text-gray-600">{p!.genre}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}