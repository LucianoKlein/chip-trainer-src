<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  modelValue: string
  length?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const len = props.length ?? 7

// 每个格子的值
const values = ref<string[]>(Array(len).fill(''))

// refs 用来控制 focus
const inputs = ref<HTMLInputElement[]>([])

// 同步外部 v-model
watch(
  () => props.modelValue,
  (val) => {
    const chars = (val ?? '').split('')
    values.value = Array(len)
      .fill('')
      .map((_, i) => chars[i] ?? '')
  },
  { immediate: true }
)

function syncValue() {
  emit('update:modelValue', values.value.join(''))
}

// 输入
function onInput(e: Event, index: number) {
  const input = e.target as HTMLInputElement
  const v = input.value.replace(/\D/g, '')

  values.value[index] = v.slice(-1) || ''
  syncValue()

  if (v && index < len - 1) {
    nextTick(() => inputs.value[index + 1]?.focus())
  }
}

// 退格
function onKeydown(e: KeyboardEvent, index: number) {
  if (e.key === 'Backspace' && !values.value[index] && index > 0) {
    nextTick(() => inputs.value[index - 1]?.focus())
  }
}

function focusIndex(index: number) {
  nextTick(() => inputs.value[index]?.focus())
}
</script>

<template>
  <div class="tournament-input">
    <div class="digits">
      <input
        v-for="(_, i) in values"
        :key="i"
        ref="inputs"
        class="digit"
        inputmode="numeric"
        maxlength="1"
        :value="values[i]"
        @input="onInput($event, i)"
        @keydown="onKeydown($event, i)"
        @click="focusIndex(i)"
      />
    </div>

    <!-- 固定展示 ,00 -->
    <span class="suffix">,00</span>
  </div>
</template>

<style scoped>
/* 外层整体 */
.tournament-input {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

/* 数字格子容器 */
.digits {
  display: flex;
  gap: 8px;
}

/* 单个格子 */
.digit {
  width: 52px;
  height: 68px;
  border: 2px solid #111;
  border-radius: 6px;
  background: #fff;
  text-align: center;
  font-size: 34px;
  font-weight: 700;
  line-height: 68px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

/* 聚焦态 */
.digit:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25);
}

/* suffix 样式 */
.suffix {
  font-size: 28px;
  font-weight: 700;
  padding-bottom: 8px;
  letter-spacing: 1px;
}
</style>
