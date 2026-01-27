<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
  import * as echarts from 'echarts'
  const props = defineProps<{
    data: {
      labels: string[]
      fullStack: number[]
      splitStack: number[]
    }
  }>()
  const chartRef = ref<HTMLDivElement | null>(null)

  let chart: echarts.ECharts | null = null
  let observer: ResizeObserver | null = null
  watch(
    () => props.data,
    () => {
      if (!chart) return

      chart.setOption({
        xAxis: { data: props.data.labels },
        series: [{ data: props.data.fullStack }, { data: props.data.splitStack }],
      })
    },
    { deep: true }
  )

  function initChart() {
    if (!chartRef.value || chart) return

    chart = echarts.init(chartRef.value)
    chart.setOption({
      grid: { left: 40, right: 20, bottom: 30 },
      tooltip: { trigger: 'axis' },
      legend: { data: ['整堆', '拆分'] },
      xAxis: {
        type: 'category',
        data: props.data.labels,
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '整堆',
          type: 'bar',
          stack: 'total',
          data: props.data.fullStack,
        },
        {
          name: '拆分',
          type: 'bar',
          stack: 'total',
          data: props.data.splitStack,
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
