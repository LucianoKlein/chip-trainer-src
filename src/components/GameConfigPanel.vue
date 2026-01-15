<script setup lang="ts">
defineProps<{
  gameType: string
  enabledColors: string[]
  whiteRange: '1-20' | '20-60'
}>()

const emit = defineEmits<{
  (e: 'update:gameType', val: string): void
  (e: 'update:enabledColors', val: string[]): void
  (e: 'update:whiteRange', val: '1-20' | '20-60'): void
}>()
</script>

<template>
  <el-form label-position="top" class="filters">
    <el-form-item label="游戏类型">
      <el-radio-group
        :model-value="gameType"
        @update:model-value="emit('update:gameType', $event)"
      >
        <el-radio label="cash">现金桌</el-radio>
        <el-radio label="tournament">锦标赛</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="筹码颜色">
      <el-checkbox-group
        :model-value="enabledColors"
        @update:model-value="emit('update:enabledColors', $event)"
      >
        <el-space size="large">
          <el-checkbox label="green">绿色</el-checkbox>
          <el-checkbox label="red">红色</el-checkbox>
          <el-checkbox label="white">白色</el-checkbox>
        </el-space>
      </el-checkbox-group>
    </el-form-item>

    <el-form-item
      v-if="enabledColors.includes('white')"
      label="白色筹码数量"
    >
      <el-radio-group
        :model-value="whiteRange"
        @update:model-value="emit('update:whiteRange', $event)"
      >
        <el-space size="large">
          <el-radio label="1-20">1–20 个白色</el-radio>
          <el-radio label="20-60">20–60 个白色</el-radio>
        </el-space>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.filters {
  margin-bottom: 12px;
}
</style>
