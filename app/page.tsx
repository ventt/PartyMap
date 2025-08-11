import MapClient from '@/components/MapClient'
import SearchBar from '@/components/SearchBar'
import { getDataSource } from '@/lib/dataSource'

export const revalidate = 60

export default async function HomePage() {
  const ds = getDataSource()
  const places = await ds.getPlaces()

  return (
    <main>
      {/* mobile: 100dvh - top(64) - bottom(64); desktop: 100dvh - top(64) */}
      <div className="h-[calc(100dvh-8rem)] md:h-[calc(100dvh-4rem)] w-full">
        <MapClient places={places} />
      </div>
    </main>
  )
}

