import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/firebase'
import { initUserProfile } from '@/services/userProfile'
import { useUserStore } from '@/stores/user'
import { doc, getDoc } from 'firebase/firestore'

export function useAuthInit() {
  const userStore = useUserStore()

  // ⭐ 初始化阶段：先 reset
  userStore.reset()

  onAuthStateChanged(auth, async (user) => {
    // 1️⃣ 未登录
    if (!user) {
      userStore.clear()
      return
    }

    // 2️⃣ 已登录，初始化 profile
    const baseProfile = await initUserProfile(user)

    // 3️⃣ 拉服务权限
    const serviceSnap = await getDoc(doc(db, 'user_activation_service', user.uid))
    const services = serviceSnap.exists() ? serviceSnap.data().services || {} : {}

    // 4️⃣ 写入 store（⚠️ 这一步会自动 profileLoaded = true）
    userStore.setProfile({
      ...baseProfile,
      services,
    })
  })
}
