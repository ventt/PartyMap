import MapClient from '@/components/MapClient'
import { getDataSource } from '@/lib/dataSource'

export const revalidate = 60

export default async function HomePage() {
  const ds = getDataSource()
  const places = await ds.getPlaces()

  return (
    // The map occupies the full viewport. Bars are fixed overlays.
    <main className="fixed inset-0">
      <MapClient places={places} />
    </main>
  )
}
