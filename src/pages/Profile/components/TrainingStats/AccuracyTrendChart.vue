<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
  import * as echarts from 'echarts'

  const chartRef = ref<HTMLDivElement | null>(null)

  let chart: echarts.ECharts | null = null
  let observer: ResizeObserver | null = null

  const props = defineProps<{
    data: { date: string; accuracy: number }[]
  }>()
  watch(
    () => props.data,
    () => {
      if (!chart) return

      chart.setOption({
        xAxis: {
          data: props.data.map((d) => d.date),
        },
        series: [
          {
            data: props.data.map((d) => d.accuracy),
          },
        ],
      })
    },
    { deep: true }
  )

  function initChart() {
    if (!chartRef.value || chart) return

    chart = echarts.init(chartRef.value)

    chart.setOption({
      grid: {
        top: 24,
        left: 40,
        right: 20,
        bottom: 30,
      },
      tooltip: {
        trigger: 'axis',
        valueFormatter: (v: number) => `${v}%`,
      },
      xAxis: {
        type: 'category',
        data: props.data.map((d) => d.date),
        axisTick: { show: false },
        axisLine: {
          lineStyle: { color: '#dcdfe6' },
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%',
        },
        splitLine: {
          lineStyle: { color: '#ebeef5' },
        },
      },
      series: [
        {
          type: 'line',
          smooth: true,
          data: props.data.map((d) => d.accuracy),
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 2,
            color: 'var(--stat-success)',
          },
          itemStyle: {
            color: 'var(--stat-success)',
          },
          areaStyle: {
            color: 'rgba(47,125,76,0.08)',
          },
        },
      ],
    })
  }

  onMounted(() => {
    if (!chartRef.value) return

    observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect

      // ✅ 只有在“真实可见 + 有尺寸”时才初始化 / resize
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
    <h3 class="section-title">正确率趋势</h3>
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
