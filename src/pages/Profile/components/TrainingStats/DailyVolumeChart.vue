<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
  import * as echarts from 'echarts'

  const chartRef = ref<HTMLDivElement | null>(null)
  let chart: echarts.ECharts | null = null
  let observer: ResizeObserver | null = null

  const props = defineProps<{
    data: { date: string; count: number }[]
  }>()
  watch(
    () => props.data,
    () => {
      if (chart) {
        chart.setOption({
          xAxis: { data: props.data.map((d) => d.date) },
          series: [{ data: props.data.map((d) => d.count) }],
        })
      }
    },
    { deep: true }
  )
  function initChart() {
    if (!chartRef.value || chart) return

    chart = echarts.init(chartRef.value)
    chart.setOption({
      grid: { top: 20, left: 40, right: 20, bottom: 30 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: props.data.map((d) => d.date),
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
      },
      series: [
        {
          type: 'bar',
          barWidth: '40%',
          data: props.data.map((d) => d.count),
        },
      ],
    })
  }

  onMounted(() => {
    if (!chartRef.value) return

    observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect

      // 🔴 关键判断：只有在“有尺寸”时才 init
      if (width > 0 && height > 0) {
        initChart()
        chart?.resize()
      }
    })

    observer.observe(chartRef.value)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    chart?.dispose()
    chart = null
  })
</script>

<template>
  <div class="ui-panel">
    <h3 class="section-title">每日练习量</h3>
    <div ref="chartRef" class="chart-container" />
  </div>
</template>

<style scoped>
  .chart-container {
    width: 100%;
    height: 280px;
  }

  .section-title {
    margin-bottom: var(--space-4);
    font-weight: 600;
  }
</style>
