import { createRouter, createWebHistory } from 'vue-router'
import { auth, db } from '@/firebase'
import MainLayout from '@/layouts/MainLayout/MainLayout.vue'
import ChipTrainer from '@/pages/ChipTrainer/Index.vue'
import Login from '@/pages/Login/Index.vue'
import { doc, getDoc } from 'firebase/firestore'
import BoardAnalysis from '@/pages/BoardAnalysis/Index.vue'
import { useUserStore } from '@/stores/user'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    /* ================= 登录页（无 Layout） ================= */
    {
      path: '/login',
      component: Login,
    },
    /* ================= 主 Layout ================= */
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'chip-trainer',
          name: 'ChipTrainer',
          component: ChipTrainer,
          meta: { layout: 'main', requiresService: 'chipTrainer' }, // 有 Sidebar
        },
        {
          path: 'board-analysis',
          name: 'boardAnalysis',
          component: BoardAnalysis,
          meta: { layout: 'main', requiresService: 'boardAnalysis' }, // 有 Sidebar
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/pages/Profile/Index.vue'),
          meta: { layout: 'simple' }, // 无 Sidebar
        },
        {
          path: 'activation',
          name: 'Activation',
          component: () => import('@/pages/Activation/Index.vue'),
          meta: { layout: 'simple' }, // 无 Sidebar
        },
        {
          path: '/403',
          component: () => import('@/pages/NoPermission/Index.vue'),
          meta: { layout: 'simple' },
        },
        {
          path: '/:pathMatch(.*)*',
          component: () => import('@/pages/NotFound/Index.vue'),
          meta: {
            layout: 'simple',
            is404: true,
          },
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 1️⃣ 404 直接放行
  if (to.matched.some((record) => record.meta.is404)) {
    return next()
  }

  // 2️⃣ 登录页放行
  if (to.path === '/login') {
    return next()
  }

  // ⭐⭐⭐ 关键：等 auth 初始化完成
  if (!userStore.profileLoaded) {
    // ⚠️ 什么都不做，等 useAuthInit 写入 store
    return next()
  }

  // 3️⃣ 未登录（profile 还没准备好 or 已退出）
  if (!userStore.profile) {
    return next('/login')
  }

  // 4️⃣ activation 仅管理员
  if (to.path === '/activation' && !userStore.isAdmin) {
    return next('/403')
  }

  // 5️⃣ 不需要服务权限的页面
  const requiredService = to.meta.requiresService
  if (!requiredService) {
    return next()
  }

  // 6️⃣ 服务校验
  const services = userStore.profile.services || {}
  const service = services[requiredService]

  if (!service || service.expiresAt.toDate() <= new Date()) {
    return next('/403')
  }

  next()
})

export default router
