import Image from 'next/image'
import Link from 'next/link'
import { getDataSource } from '@/lib/dataSource'
import { notFound } from 'next/navigation'
import { fmtRange } from '@/lib/time'

export const revalidate = 60

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ds = getDataSource()
  const event = await ds.getEvent(id)
  if (!event) return notFound()
  const place = await ds.getPlace(event.placeId)
  const performers = await Promise.all(event.performerIds.map(pid => ds.getPerformer(pid)))

  return (
    <main className="p-4 pb-24 md:pb-0">
      <Link href="/" className="text-violet-600 dark:text-violet-300 text-sm">← Back</Link>
      <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-white/85 dark:bg-zinc-950/80 backdrop-blur">
        <Image src={event.image} alt={event.title} width={1600} height={900} className="h-56 w-full object-cover"/>
        <div className="p-4">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{fmtRange(event.start, event.end)}</p>
          {place && (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              at <Link href={`/places/${place.id}`} className="text-violet-600 dark:text-violet-300 hover:underline">{place.name}</Link>
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
            <li key={p!.id} className="rounded-2xl border border-white/10 bg-white/85 dark:bg-zinc-950/80 backdrop-blur p-4">
              <Link href={`/performers/${p!.id}`} className="text-violet-600 dark:text-violet-300 hover:underline font-medium">{p!.name}</Link>
              <div className="text-sm text-zinc-600 dark:text-zinc-300">{p!.genre}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
