import type { PopupController } from './types'

export class PopupControllerImpl implements PopupController {
  private openIds: string[] = []
  open(id: string) {
    // Enforce single popup: close others, then open this
    const alreadyOpen = this.openIds.length === 1 && this.openIds[0] === id
    if (alreadyOpen) return
    this.closeAll()
    this.openIds = [id]
    try { window.dispatchEvent(new CustomEvent('pm:open-place-popup', { detail: { placeId: id } })) } catch {}
  }
  close(id: string) {
    // If the target is open, close all; otherwise no-op
    if (this.openIds.includes(id)) {
      this.closeAll()
    }
  }
  closeAll() {
    if (this.openIds.length === 0) {
      // Still emit to keep UI consistent across instances
      try { window.dispatchEvent(new Event('pm:close-popups')) } catch {}
      return
    }
    this.openIds = []
    try { window.dispatchEvent(new Event('pm:close-popups')) } catch {}
  }
  getOpen() { return this.openIds }
}
