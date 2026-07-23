import { defineStore } from 'pinia'

export const useCueRequestStore = defineStore('cue-request', {
  state: () => ({
    openCueId: null as string | null,
    requestToken: 0
  }),
  actions: {
    requestOpen(triggerId: string) {
      this.openCueId = triggerId
      this.requestToken += 1
    },
    clear() {
      this.openCueId = null
    }
  }
})