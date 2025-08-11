import { createRepositories, getDataSource } from '../dataSource'

// Example service layer encapsulating higher-level event operations
export async function getDetailedEvent(id: string) {
  const ds = getDataSource()
  const { events, places, performers } = createRepositories(ds)
  const event = await events.byId(id)
  if (!event) return undefined
  const place = await places.byId(event.placeId)
  const performerEntities = await Promise.all(event.performerIds.map(pid => performers.byId(pid)))
  return { event, place, performers: performerEntities.filter(Boolean) }
}
