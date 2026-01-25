import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as any,
  }),

  actions: {
    setProfile(profile: any) {
      this.profile = profile
    },
    reset() {
      this.profile = null
    },
  },

  persist: {
    key: 'user', // ⭐ 固定 key
    storage: localStorage,
  },
})
