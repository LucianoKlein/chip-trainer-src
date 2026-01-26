import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'

export type UserRole = 'admin' | 'user'

export interface UserProfile {
  uid: string
  email: string | null
  role: UserRole
  createdAt: any
  services: Record<
    string,
    {
      expiresAt: any
    }
  >
}

/**
 * 初始化用户 profile
 * - 第一次登录：创建 users/{uid}
 * - 如果系统还没有 admin：当前用户 => admin
 * - 否则 => user
 */
export async function initUserProfile(user: {
  uid: string
  email: string | null
}): Promise<Omit<UserProfile, 'services'>> {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    return {
      uid: user.uid,
      ...(snap.data() as any),
    }
  }

  const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'))
  const adminSnap = await getDocs(adminQuery)

  const role: UserRole = adminSnap.empty ? 'admin' : 'user'

  const profile = {
    uid: user.uid,
    email: user.email,
    role,
    createdAt: serverTimestamp(),
  }

  await setDoc(ref, profile)

  return profile
}

/**
 * 读取用户 profile
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}
