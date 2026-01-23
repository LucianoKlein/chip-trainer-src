<script setup lang="ts">
  import { ref } from 'vue'

  const stakes = ref('1/2/5')
  const playerCount = ref(8)

  const emit = defineEmits<{
    (e: 'change-stakes', value: string): void
    (e: 'change-player-count', value: number): void
  }>()

  function onStakesChange(value: string) {
    emit('change-stakes', value)
  }

  function onPlayerCountChange(value: number) {
    emit('change-player-count', value)
  }
</script>

<template>
  <div class="ui-panel pot-config-bar">
    <!-- 左侧：配置 -->
    <div class="config-left">
      <span class="config-label">Stakes</span>
      <el-select
        :teleported="false"
        v-model="stakes"
        size="small"
        style="width: 200px"
        @change="onStakesChange"
      >
        <el-option label="1/2/5 Pot Limit" value="1/2/5" />
        <el-option label="1/2 Pot Limit" value="1/2" />
        <el-option label="5/5 Pot Limit w/rock" value="5/5" />
        <el-option label="25/50 Pot Limit" value="25/50" />
      </el-select>

      <span class="config-label">玩家数量</span>
      <el-select
        :teleported="false"
        v-model="playerCount"
        size="small"
        style="width: 120px"
        @change="onPlayerCountChange"
      >
        <el-option v-for="n in 7" :key="n + 1" :label="`${n + 1} 人`" :value="n + 1" />
      </el-select>
    </div>

    <!-- 右侧：操作 -->
    <div class="config-right">
      <!-- 暂时留空，后续可以添加按钮 -->
    </div>
  </div>
</template>

<style scoped>
  .pot-config-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 12px 16px;
    margin-bottom: 16px;

    background: #fff;
    border-radius: 12px;
    box-shadow: var(--shadow-sm);
  }

  /* 左侧配置 */
  .config-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .config-label {
    font-size: 13px;
    color: var(--text-secondary, #666);
  }

  /* 右侧操作 */
  .config-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
