<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
  import * as echarts from 'echarts'
  const props = defineProps<{
    data: {
      points: Array<[number, number]>
    }
  }>()
  const chartRef = ref<HTMLDivElement | null>(null)

  let chart: echarts.ECharts | null = null
  let observer: ResizeObserver | null = null

  function initChart() {
    if (!chartRef.value || chart) return

    chart = echarts.init(chartRef.value)
    chart.setOption({
      grid: { left: 40, right: 20, bottom: 30 },
      tooltip: { trigger: 'item' },
      xAxis: {
        name: '正确答案',
        type: 'value',
      },
      yAxis: {
        name: '错误答案',
        type: 'value',
      },
      series: [
        {
          type: 'scatter',
          symbolSize: 8,
          data: props.data.points,
        },
      ],
    })
  }
  watch(
    () => props.data.points,
    () => {
      if (!chart) return

      chart.setOption({
        series: [
          {
            data: props.data.points,
          },
        ],
      })
    },
    { deep: true }
  )

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
