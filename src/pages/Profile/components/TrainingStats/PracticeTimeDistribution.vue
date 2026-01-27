<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import * as echarts from 'echarts'

  const chartRef = ref<HTMLDivElement | null>(null)

  let chart: echarts.ECharts | null = null
  let observer: ResizeObserver | null = null

  /* ================= Mock 数据 =================
   * hour: 0 - 23
   * count: 该时间段练习题数
   */
  const mockData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: Math.floor(Math.random() * 10 + 2),
  }))

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
      },
      xAxis: {
        type: 'category',
        data: mockData.map((d) => `${d.hour}`),
        name: '小时',
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        name: '题目数',
        minInterval: 1,
        splitLine: {
          lineStyle: { color: '#ebeef5' },
        },
      },
      series: [
        {
          type: 'bar',
          barWidth: '60%',
          data: mockData.map((d) => d.count),
        },
      ],
    })
  }

  onMounted(() => {
    if (!chartRef.value) return

    observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect

      // ✅ 等容器真实可见后再 init / resize
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
    <h3 class="section-title">练习时间段分布</h3>
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
