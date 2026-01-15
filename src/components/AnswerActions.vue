<script setup lang="ts">
defineProps<{
  feedback: 'idle' | 'correct' | 'wrong'
  showAnswer: boolean
  correctValue: number
}>()

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'next'): void
  (e: 'toggleAnswer'): void
}>()
</script>

<template>
  <div class="answer-actions">
    <div class="actions">
      <button @click="emit('submit')">提交</button>
      <button @click="emit('next')">换一题</button>
      <button @click="emit('toggleAnswer')">显示答案</button>
    </div>

    <p v-if="feedback === 'correct'" class="ok">正确！</p>
    <p v-else-if="feedback === 'wrong'" class="err">不对哦～</p>

    <p v-if="showAnswer">答案是: {{ correctValue }}</p>
  </div>
</template>

<style scoped>
.answer-actions {
  display: grid;
  gap: 10px;
}

.actions {
  display: flex;
  gap: 8px;
}

.ok {
  color: #16a34a;
}

.err {
  color: #dc2626;
}
</style>
