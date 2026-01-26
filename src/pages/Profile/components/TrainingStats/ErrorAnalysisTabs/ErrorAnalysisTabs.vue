<script setup lang="ts">
  import { ref, nextTick } from 'vue'
  import ErrorChipStructure from './ErrorChipStructure.vue'
  import ErrorAnswerDiff from './ErrorAnswerDiff.vue'
  import ErrorThinkingTime from './ErrorThinkingTime.vue'
  const props = defineProps<{
    chipStructure: {
      labels: string[]
      fullStack: number[]
      splitStack: number[]
    }
    answerDiff: {
      points: Array<[number, number]>
    }
  }>()
  const activeTab = ref('chip')

  async function handleTabChange() {
    await nextTick()
    window.dispatchEvent(new Event('resize'))
  }
</script>

<template>
  <div class="ui-panel">
    <h3 class="section-title">错题分析</h3>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- <el-tab-pane label="筹码结构" name="chip">
        <ErrorChipStructure :data="props.chipStructure" />
      </el-tab-pane> -->

      <el-tab-pane label="答案偏差" name="answer">
        <ErrorAnswerDiff :data="props.answerDiff" />
      </el-tab-pane>

      <el-tab-pane label="思考时间" name="time">
        <ErrorThinkingTime />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
