import { events, performers, places } from './data/mock'
import type { Event, Performer, Place } from './types'

export interface IDataSource {
  getPlaces(): Promise<Place[]>
  getPlace(id: string): Promise<Place | undefined>
  getEvents(): Promise<Event[]>
  getEvent(id: string): Promise<Event | undefined>
  getPerformers(): Promise<Performer[]>
  getPerformer(id: string): Promise<Performer | undefined>
}

class MockDataSource implements IDataSource {
  async getPlaces() { return places }
  async getPlace(id: string) { return places.find(p => p.id === id) }
  async getEvents() { return events }
  async getEvent(id: string) { return events.find(e => e.id === id) }
  async getPerformers() { return performers }
  async getPerformer(id: string) { return performers.find(a => a.id === id) }
}

class ApiDataSource implements IDataSource {
  private base = process.env.RESOURCE_API_BASE_URL || ''
  private async json<T>(path: string): Promise<T> {
    const res = await fetch(`${this.base}${path}`, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`)
    return res.json() as Promise<T>
  }
  getPlaces() { return this.json<Place[]>('/places') }
  getPlace(id: string) { return this.json<Place>(`/places/${id}`) }
  getEvents() { return this.json<Event[]>('/events') }
  getEvent(id: string) { return this.json<Event>(`/events/${id}`) }
  getPerformers() { return this.json<Performer[]>('/performers') }
  getPerformer(id: string) { return this.json<Performer>(`/performers/${id}`) }
}

export function getDataSource(): IDataSource {
  const mode = (process.env.DATA_SOURCE || 'mock').toLowerCase()
  return mode === 'api' ? new ApiDataSource() : new MockDataSource()
}