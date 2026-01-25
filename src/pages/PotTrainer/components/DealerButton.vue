<script setup lang="ts">
import { ref, computed } from 'vue'

interface Anchor {
  x: number
  y: number
}

const props = defineProps<{
  anchors: Anchor[]
  currentAnchorIndex: number
}>()

const emit = defineEmits<{
  (e: 'update:currentAnchorIndex', value: number): void
}>()

const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const currentX = ref(0)
const currentY = ref(0)
const boardOffsetX = ref(0)
const boardOffsetY = ref(0)

// 当前位置（拖动时使用临时位置，否则使用锚点位置）
const position = computed(() => {
  if (isDragging.value) {
    return {
      left: `${currentX.value}px`,
      top: `${currentY.value}px`,
    }
  } else {
    const anchor = props.anchors[props.currentAnchorIndex]
    return {
      left: `${anchor.x}px`,
      top: `${anchor.y}px`,
    }
  }
})

// 计算到最近锚点的距离
function findNearestAnchor(x: number, y: number): number {
  let minDistance = Infinity
  let nearestIndex = 0

  props.anchors.forEach((anchor, index) => {
    const distance = Math.sqrt(
      Math.pow(x - anchor.x, 2) + Math.pow(y - anchor.y, 2)
    )
    if (distance < minDistance) {
      minDistance = distance
      nearestIndex = index
    }
  })

  return nearestIndex
}

function onMouseDown(e: MouseEvent) {
  isDragging.value = true

  // 获取board的位置
  const boardElement = (e.target as HTMLElement).closest('.board-overlay')
  if (boardElement) {
    const rect = boardElement.getBoundingClientRect()
    boardOffsetX.value = rect.left
    boardOffsetY.value = rect.top
  }

  const anchor = props.anchors[props.currentAnchorIndex]
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  currentX.value = anchor.x
  currentY.value = anchor.y

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  e.preventDefault()
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return

  // 计算相对于board的坐标
  const relativeX = e.clientX - boardOffsetX.value
  const relativeY = e.clientY - boardOffsetY.value

  currentX.value = relativeX
  currentY.value = relativeY
}

function onMouseUp() {
  if (!isDragging.value) return

  // 找到最近的锚点
  const nearestIndex = findNearestAnchor(currentX.value, currentY.value)
  emit('update:currentAnchorIndex', nearestIndex)

  isDragging.value = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}
</script>

<template>
  <div
    class="dealer-button"
    :class="{ dragging: isDragging }"
    :style="position"
    @mousedown="onMouseDown"
  >
    DEALER
  </div>
</template>

<style scoped>
.dealer-button {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: white;
  border: 3px solid black;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  color: black;
  cursor: grab;
  user-select: none;
  transform: translate(-50%, -50%);
  z-index: 1000;
  transition: transform 0.1s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dealer-button:hover {
  transform: translate(-50%, -50%) scale(1.05);
}

.dealer-button.dragging {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.1);
  transition: none;
  z-index: 1001;
}
</style>
