import type { Highlighter } from './types'

export class HighlighterImpl implements Highlighter {
  private ids: string[] = []
  set(ids: string[]) {
    this.ids = Array.from(new Set(ids))
    try { window.dispatchEvent(new CustomEvent('pm:highlight-places', { detail: { placeIds: this.ids } })) } catch {}
  }
  clear() {
    this.ids = []
    try { window.dispatchEvent(new CustomEvent('pm:highlight-places', { detail: { placeIds: [] } })) } catch {}
  }
  get() { return this.ids }
}
