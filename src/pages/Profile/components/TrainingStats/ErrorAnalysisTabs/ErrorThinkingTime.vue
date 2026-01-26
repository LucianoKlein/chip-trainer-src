<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import * as echarts from 'echarts'

  const chartRef = ref<HTMLDivElement | null>(null)

  let chart: echarts.ECharts | null = null
  let observer: ResizeObserver | null = null

  function initChart() {
    if (!chartRef.value || chart) return

    chart = echarts.init(chartRef.value)
    chart.setOption({
      grid: { left: 40, right: 20, bottom: 30 },
      xAxis: {
        type: 'category',
        data: ['错题'],
      },
      yAxis: {
        name: '秒',
        type: 'value',
      },
      series: [
        {
          type: 'boxplot',
          data: [[3.2, 4.1, 4.8, 6.3, 8.9]],
        },
      ],
    })
  }

  onMounted(() => {
    if (!chartRef.value) return

    observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
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
  <div ref="chartRef" class="chart-container" />
</template>

<style scoped>
  .chart-container {
    width: 100%;
    height: 260px;
  }
</style>
