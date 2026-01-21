<template>
  <div
    class="card-stack"
    :style="{
      transform: `scale(${scale})`,
    }"
  >
    <!-- 厚度底座 -->
    <div class="stack-base"></div>

    <div
      v-for="i in count"
      :key="i"
      class="card-layer"
      :style="{
        top: `${i * offset}px`,
        left: `0px`,
        zIndex: i,
        opacity: i < count - 3 ? 0.9 : 1,
      }"
    >
      <img :src="backImg" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import backImg from '@/assets/bg/poke.png'

  defineProps<{
    count?: number
    offset?: number
    scale?: number
  }>()
</script>

<script lang="ts">
  export default {
    props: {
      count: { type: Number, default: 14 },
      offset: { type: Number, default: 2.2 }, // ✅ 更明显的厚度
      scale: { type: Number, default: 1 },
    },
  }
</script>

<style scoped>
  .card-stack {
    position: relative;
    width: 100px;
    height: 150px;
    transform-origin: center center;
  }

  /* 模拟“整副牌的厚度” */
  .stack-base {
    position: absolute;
    top: 6px;
    left: 2px;
    width: 90px;
    height: 130px;
    border-radius: 10px;
    background: #e8e8e8;
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.35);
  }

  /* 单张牌 */
  .card-layer {
    position: absolute;
    width: 90px;
    height: 130px;
    border-radius: 10px;
    overflow: hidden;
    background: white;

    /* 关键：不是“卡片阴影”，而是“叠加阴影” */
    box-shadow:
      0 1px 1px rgba(0, 0, 0, 0.15),
      0 3px 6px rgba(0, 0, 0, 0.2);
  }

  .card-layer img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
