<script setup lang="ts">
  import { computed } from 'vue'

  interface Summary {
    totalQuestions: number
    accuracy: number // 0~1
    avgAnswerTimeMs: number // ms
    medianAnswerTimeMs: number // ms
  }

  const props = defineProps<{
    summary: Summary | null
  }>()

  const accuracyPercent = computed(() =>
    props.summary ? Math.round(props.summary.accuracy * 100) : 0
  )

  const avgTimeSec = computed(() =>
    props.summary ? Math.round(props.summary.avgAnswerTimeMs / 100) / 10 : 0
  )

  const medianTimeSec = computed(() =>
    props.summary ? Math.round(props.summary.medianAnswerTimeMs / 100) / 10 : 0
  )
</script>

<template>
  <div class="stat-cards">
    <div class="ui-panel stat-card">
      <div class="stat-title">练习题数</div>
      <div class="stat-value stat-neutral">
        {{ props.summary?.totalQuestions ?? 0 }}
      </div>
    </div>

    <div class="ui-panel stat-card">
      <div class="stat-title">总正确率</div>
      <div class="stat-value stat-success">{{ accuracyPercent }}%</div>
    </div>

    <div class="ui-panel stat-card">
      <div class="stat-title">平均答题时间</div>
      <div class="stat-value stat-time">{{ avgTimeSec }} s</div>
    </div>

    <div class="ui-panel stat-card">
      <div class="stat-title">中位答题时间</div>
      <div class="stat-value stat-time">{{ medianTimeSec }} s</div>
    </div>
  </div>
</template>

<style scoped>
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .stat-title {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .stat-value {
    margin-top: var(--space-2);
    font-size: 26px;
    font-weight: 600;
  }

  .stat-neutral {
    color: var(--stat-neutral);
  }

  .stat-success {
    color: var(--stat-success);
  }

  .stat-time {
    color: var(--stat-time);
  }
</style>
