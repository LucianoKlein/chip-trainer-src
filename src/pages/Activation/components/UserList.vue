<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'

  import { useUserList, type UserItem } from '@/composables/useUserList'

  /* ================= 路由 ================= */
  const router = useRouter()

  /* ================= 用户查询（hook） ================= */

  const { users, keyword, loading, loadUsers } = useUserList(20) // 管理员列表一般不用太小分页

  onMounted(() => {
    loadUsers(true)
  })

  /* ================= 跳转 ================= */

  function goToUserStats(user: UserItem) {
    router.push({
      name: 'AdminUserStats',
      params: { userId: user.uid },
      query: { email: user.email },
    })
  }

  function viewTrainingDetail(user: UserItem) {
    router.push({
      name: 'AdminUserStats',
      params: { userId: user.uid },
      query: {
        email: user.email,
        from: 'user-list',
      },
    })
  }
</script>

<template>
  <div class="ui-content-column">
    <!-- ================= 搜索 ================= -->
    <div class="search-panel">
      <el-input v-model="keyword" placeholder="搜索学员邮箱" clearable />
    </div>

    <!-- ================= 列表 ================= -->
    <div class="list-panel">
      <el-table
        :data="users"
        v-loading="loading"
        stripe
        style="width: 100%"
        @row-click="goToUserStats"
      >
        <el-table-column prop="email" label="学员邮箱" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button type="primary" link @click.stop="viewTrainingDetail(row)">
              查看训练详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!users.length && !loading" description="没有匹配的学员" />
    </div>
  </div>
</template>

<style scoped>
  .search-panel {
    margin-bottom: var(--space-6);
  }

  .list-panel {
    padding-top: var(--space-4);
    padding-bottom: var(--space-4);
  }
</style>
