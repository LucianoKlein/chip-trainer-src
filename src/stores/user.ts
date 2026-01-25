import { defineStore } from 'pinia'
import type { UserProfile } from '@/services/userProfile'

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as UserProfile | null,
    profileLoaded: false, // ⭐ 新增核心字段，用来标识是否加载完 profile
  }),

  getters: {
    isAdmin: (state) => {
      // ⭐ 只有 profile 加载完成，且 role 为 admin 才返回 true
      return state.profileLoaded && state.profile?.role === 'admin'
    },
  },

  actions: {
    setProfile(profile: UserProfile) {
      this.profile = profile
      this.profileLoaded = true // 加载完 profile 设置为 true
    },

    clear() {
      this.profile = null
      this.profileLoaded = true // 明确知道没有 profile 了
    },

    reset() {
      this.profile = null
      this.profileLoaded = false // 重新初始化，表示 profile 还没有加载
    },
  },
})
