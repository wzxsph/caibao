import { defineStore } from 'pinia'

/**
 * Pinia store shared between BetaShowcasePlayer (POI chips) and
 * FinanceCueExtension (cue lifecycle).
 *
 * Two independent flows:
 *
 * 1. `activeCueId` / `activeCueToken` — set when a cue is surfaced (its
 *    startMs has been crossed). Cleared when the cue window ends or is
 *    dismissed. BetaShowcasePlayer watches this to flash the matching POI
 *    chip for the cue's `cueDurationMs`.
 *
 * 2. `openCueId` / `openCueToken` — set when a user explicitly opens a cue
 *    (via POI click). Watched by FinanceCueExtension to call openCue().
 */
export const useCueRequestStore = defineStore('cue-request', {
  state: () => ({
    activeCueId: null as string | null,
    activeCueToken: 0,
    openCueId: null as string | null,
    openCueToken: 0
  }),
  actions: {
    setActive(triggerId: string) {
      this.activeCueId = triggerId
      this.activeCueToken += 1
    },
    clearActive() {
      this.activeCueId = null
    },
    requestOpen(triggerId: string) {
      this.openCueId = triggerId
      this.openCueToken += 1
    },
    clearOpen() {
      this.openCueId = null
    },
    clear() {
      this.activeCueId = null
      this.openCueId = null
    }
  }
})