<script setup lang="ts">
  import { onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { updateDoc, doc } from 'firebase/firestore'
  import { db } from '@/firebase'

  import { useUserList, type UserItem } from '@/composables/useUserList'

  /* ================= 用户列表 ================= */

  const { users, keyword, loading, currentPage, total, pageSize, loadUsers, handlePageChange } =
    useUserList(10)

  /* ================= 初始化 ================= */

  onMounted(() => {
    loadUsers(true)
  })

  /* ================= 操作 ================= */

  async function toggleRole(user: UserItem) {
    const targetRole = user.role === 'admin' ? 'user' : 'admin'

    await ElMessageBox.confirm(
      `确定将该用户设为「${targetRole === 'admin' ? '管理员' : '普通用户'}」？`,
      '确认操作',
      { type: 'warning' }
    )

    await updateDoc(doc(db, 'users', user.uid), {
      role: targetRole,
    })

    user.role = targetRole
    ElMessage.success('角色已更新')
  }

  /* ================= 工具 ================= */

  function formatDate(date: Date | null) {
    if (!date) return '-'
    return date.toISOString().slice(0, 10)
  }
</script>

<template>
  <div class="admin-panel">
    <!-- 标题 -->
    <h2 class="panel-title">管理员指派</h2>

    <!-- 搜索 -->
    <el-input v-model="keyword" placeholder="按邮箱搜索用户" clearable class="search-input" />

    <!-- 表格 -->
    <el-table :data="users" v-loading="loading" empty-text="暂无用户数据" class="user-table">
      <el-table-column prop="email" label="邮箱" />

      <el-table-column label="注册时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column label="当前身份" width="120">
        <template #default="{ row }">
          <span :class="['role-tag', row.role === 'admin' ? 'is-admin' : 'is-user']">
            {{ row.role === 'admin' ? '管理员' : '普通用户' }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button
            size="small"
            :type="row.role === 'admin' ? 'danger' : 'primary'"
            @click="toggleRole(row)"
          >
            {{ row.role === 'admin' ? '取消管理员' : '指派为管理员' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="panel-pagination">
      <el-pagination
        background
        layout="prev, pager, next"
        :page-size="pageSize"
        :current-page="currentPage"
        :total="total"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
  /* ================= ui-panel ================= */

  .admin-panel {
    padding: var(--space-6);
    background: var(--color-bg-container);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  /* ================= 标题 ================= */

  .panel-title {
    margin: 0 0 var(--space-4);
    font-size: var(--font-size-md);
    font-weight: 600;
    color: var(--color-text-primary);
  }

  /* ================= 搜索 ================= */

  .search-input {
    max-width: 320px;
    margin-bottom: var(--space-4);
  }

  /* ================= 表格 ================= */

  .user-table {
    width: 100%;
  }

  /* ================= 角色 ================= */

  .role-tag {
    font-size: var(--font-size-xs);
    font-weight: 500;
  }

  .role-tag.is-admin {
    color: var(--color-danger);
  }

  .role-tag.is-user {
    color: var(--color-text-secondary);
  }

  /* ================= 分页 ================= */

  .panel-pagination {
    margin-top: var(--space-4);
    display: flex;
    justify-content: flex-end;
  }
</style>
