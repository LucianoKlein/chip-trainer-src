import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { initUserProfile } from '@/services/userProfile'
import { useUserStore } from '@/stores/user'
import type { User } from 'firebase/auth'

export async function useUserBootstrap(user: User) {
  const userStore = useUserStore()

  // 清空旧数据
  userStore.reset()

  // 拉基础信息
  const baseProfile = await initUserProfile(user)

  // 拉权限
  const snap = await getDoc(doc(db, 'user_activation_service', user.uid))

  const services = snap.exists() ? snap.data().services || {} : {}

  // 写入本地（Pinia + localStorage）
  userStore.setProfile({
    ...baseProfile,
    services,
  })
}
