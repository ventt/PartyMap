import Image from 'next/image'
import Link from 'next/link'
import { getDataSource } from '@/lib/dataSource'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function PerformerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ds = getDataSource()
  const performer = await ds.getPerformer(id)
  if (!performer) return notFound()
  const events = (await ds.getEvents()).filter(e => e.performerIds.includes(performer.id))

  return (
    <main className="p-4 pb-24 md:pb-0">
      <Link href="/" className="text-violet-600 dark:text-violet-300 text-sm">← Back</Link>
      <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-white/85 dark:bg-zinc-950/80 backdrop-blur">
        <Image src={performer.image} alt={performer.name} width={1600} height={900} className="h-56 w-full object-cover"/>
        <div className="p-4">
          <h1 className="text-2xl font-bold">{performer.name}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{performer.genre}</p>
          <p className="mt-2 text-sm">{performer.bio}</p>
          {performer.links && (
            <div className="mt-2 flex gap-3 text-sm">
              {performer.links.map(l => (
                <a key={l.url} href={l.url} target="_blank" className="text-violet-600 dark:text-violet-300 hover:underline">{l.type}</a>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="mt-4">
        <h2 className="mb-2 text-lg font-semibold">Events</h2>
        <ul className="grid grid-cols-1 gap-3">
          {events.length === 0 && <p className="text-sm text-zinc-600 dark:text-zinc-300">No events yet.</p>}
          {events.map(e => (
            <li key={e.id} className="rounded-2xl border border-white/10 bg-white/85 dark:bg-zinc-950/80 backdrop-blur p-4">
              <Link href={`/events/${e.id}`} className="text-violet-600 dark:text-violet-300 hover:underline font-medium">{e.title}</Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
