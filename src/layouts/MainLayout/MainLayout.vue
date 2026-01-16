<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const locale = ref('zh-CN')

  function goHome() {
    router.push('/chip-trainer')
  }

  function onLocaleChange(val: string) {
    console.log('switch locale:', val)
  }

  function onLogin() {
    console.log('login')
  }
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="header-left" @click="goHome">
        <span class="brand">德州扑克</span>
      </div>

      <div class="header-right">
        <el-select v-model="locale" size="small" class="locale-select" @change="onLocaleChange">
          <el-option label="简体中文" value="zh-CN"></el-option>
          <el-option label="English" value="en-US"></el-option>
        </el-select>

        <el-button type="primary" size="small" @click="onLogin"> 登录 </el-button>
      </div>
    </header>

    <div class="main">
      <aside class="sidebar">
        <el-menu router default-active="/chip-trainer" class="menu">
          <el-menu-item index="/chip-trainer"> 筹码反应训练 </el-menu-item>
        </el-menu>
      </aside>

      <main class="content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
  .layout {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--el-bg-color-page);
  }

  /* ================= Header ================= */
  .header {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 16px;
    background-color: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .header-left {
    cursor: pointer;
  }

  .brand {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .locale-select {
    width: 110px;
  }

  /* ================= Main ================= */
  .main {
    flex: 1;
    display: flex;
    min-height: 0;
  }

  /* ================= Sidebar ================= */
  .sidebar {
    width: 200px;
    background-color: var(--el-bg-color);
    border-right: 1px solid var(--el-border-color-light);
  }

  .menu {
    border-right: none;
  }

  .content {
    flex: 1;
    padding: 16px;
    overflow: auto;
  }
</style>
