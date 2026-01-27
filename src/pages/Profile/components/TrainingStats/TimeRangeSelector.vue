<script setup lang="ts">
  import { ref, watch } from 'vue'

  const props = defineProps<{
    modelValue: 'all' | '7d' | '30d' | 'custom'
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void
  }>()

  const selected = ref(props.modelValue)
  const dateRange = ref<[Date, Date] | null>(null)

  watch(selected, (val) => {
    if (val !== 'custom') {
      emit('update:modelValue', { type: val })
    }
  })

  watch(dateRange, (val) => {
    if (val && selected.value === 'custom') {
      emit('update:modelValue', {
        type: 'custom',
        start: val[0].getTime(),
        end: val[1].getTime(),
      })
    }
  })
</script>
<template>
  <div class="ui-panel">
    <el-radio-group v-model="selected">
      <el-radio-button label="all">全部</el-radio-button>
      <el-radio-button label="7d">7 天</el-radio-button>
      <el-radio-button label="30d">30 天</el-radio-button>
      <el-radio-button label="custom">自定义</el-radio-button>
    </el-radio-group>

    <el-date-picker
      v-if="selected === 'custom'"
      v-model="dateRange"
      style="margin-top: var(--space-4)"
      type="daterange"
      start-placeholder="开始"
      end-placeholder="结束"
    />
  </div>
</template>
