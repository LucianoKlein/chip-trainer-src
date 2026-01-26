import { ref, watch } from 'vue'
import {
  collection,
  getDocs,
  query,
  orderBy,
  startAfter,
  limit,
  where,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/firebase'

export type UserItem = {
  uid: string
  email: string
  role: 'admin' | 'user'
  createdAt: Date | null
}

export function useUserList(pageSize = 10) {
  /* ================= 状态 ================= */

  const users = ref<UserItem[]>([])
  const keyword = ref('')
  const loading = ref(false)

  const currentPage = ref(1)
  const total = ref(0)

  let lastVisible: QueryDocumentSnapshot<DocumentData> | null = null

  /* ================= 查询 ================= */

  async function loadUsers(reset = false) {
    loading.value = true

    try {
      if (reset) {
        users.value = []
        currentPage.value = 1
        lastVisible = null
      }

      const baseRef = collection(db, 'users')

      let q

      if (keyword.value) {
        // 邮箱前缀搜索
        q = query(
          baseRef,
          orderBy('email'),
          where('email', '>=', keyword.value),
          where('email', '<=', keyword.value + '\uf8ff'),
          limit(pageSize)
        )
      } else {
        q = query(
          baseRef,
          orderBy('createdAt', 'desc'),
          ...(lastVisible ? [startAfter(lastVisible)] : []),
          limit(pageSize)
        )
      }

      const snap = await getDocs(q)

      if (snap.empty) {
        users.value = []
        total.value = 0
        return
      }

      lastVisible = snap.docs[snap.docs.length - 1]

      users.value = snap.docs.map((d) => {
        const data = d.data()
        return {
          uid: d.id,
          email: data.email,
          role: data.role ?? 'user',
          createdAt: data.createdAt?.toDate?.() ?? null,
        }
      })

      // Firestore 无 count，这里是管理页可接受的近似方案
      total.value = users.value.length + (currentPage.value - 1) * pageSize
    } finally {
      loading.value = false
    }
  }

  /* ================= 搜索监听 ================= */

  watch(keyword, () => {
    loadUsers(true)
  })

  /* ================= 分页 ================= */

  function handlePageChange(page: number) {
    currentPage.value = page
    loadUsers()
  }

  return {
    users,
    keyword,
    loading,
    currentPage,
    total,
    pageSize,
    loadUsers,
    handlePageChange,
  }
}
