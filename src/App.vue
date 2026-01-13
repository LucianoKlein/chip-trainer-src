<script setup>
import { ref, computed } from 'vue'
import ChipStack from '@/components/ChipStack.vue'

/**
 * 每个红色筹码代表的数值
 */
const CHIP_VALUE = 5

/**
 * 题库：筹码数量 10 ～ 100（步长 5）
 */
const targets = Array.from(
  { length: 19 },
  (_, i) => 10 + i * 5
)

const round = ref(0)
const target = ref(10)          // 当前题目的“筹码个数”
const userInput = ref('')
const feedback = ref('idle')    // idle | correct | wrong
const color = ref('red')

// 剩余部分的分组（4 或 5），每一题只决定一次
const remainderGroupSize = ref(null)

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function newRound() {
  round.value++
  target.value = pickRandom(targets)
  userInput.value = ''
  feedback.value = 'idle'

  // 只有存在余数时，才需要 4 / 5 分组
  remainderGroupSize.value =
    target.value % 20 === 0 ? null : pickRandom([4, 5])
}

/**
 * 根据筹码个数计算堆叠
 * 规则：
 * - 优先使用 20 个一堆
 * - 剩余部分使用 4 或 5
 */
const stacks = computed(() => {
  const total = target.value
  const result = []

  // 20 个一堆
  const full20 = Math.floor(total / 20)
  for (let i = 0; i < full20; i++) {
    result.push(20)
  }

  // 剩余部分
  const rem = total % 20
  if (rem > 0) {
    const g = remainderGroupSize.value ?? 5
    const full = Math.floor(rem / g)
    for (let i = 0; i < full; i++) {
      result.push(g)
    }
    const last = rem % g
    if (last > 0) result.push(last)
  }

  return result
})

function onSubmit() {
  const val = parseInt(userInput.value, 10)
  if (Number.isNaN(val)) {
    feedback.value = 'wrong'
    return
  }

  const correctValue = target.value * CHIP_VALUE

  if (val === correctValue) {
    feedback.value = 'correct'
    setTimeout(newRound, 700)
  } else {
    feedback.value = 'wrong'
  }
}

// 初始化第一题
newRound()
</script>

<template>
  <main class="app">
    <header class="topbar">
      <h1>筹码反应训练</h1>
    </header>

    <section class="board">
      <div class="stacks">
        <div
          v-for="(cnt, idx) in stacks"
          :key="`${round}-${idx}-${cnt}`"
          class="stack"
        >
          <ChipStack
            :color="color"
            :count="cnt"
            :size="72"
            :spacing="10"
            :seed="`${round}-${idx}`"
          />
        </div>
      </div>
    </section>

    <section class="answer">
      <label class="input-wrap">
        请输入红色筹码代表的总数值（每个 = 5）：
        <input
          v-model="userInput"
          type="number"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="例如 175"
          @keyup.enter="onSubmit"
          :class="feedback"
        />
      </label>

      <div class="actions">
        <button @click="onSubmit">提交</button>
        <button class="next" @click="newRound">换一题</button>
      </div>

      <p v-if="feedback === 'correct'" class="ok">
        正确！已为你生成下一题…
      </p>
      <p v-else-if="feedback === 'wrong'" class="err">
        不对哦，再看看筹码～
      </p>
    </section>
  </main>
</template>

<style scoped>
.app {
  max-width: 820px;
  margin: 0 auto;
  padding: 16px;
}

.topbar {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.board {
  margin: 16px 0 8px;
}

.stacks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  align-items: flex-end;
}

.stack {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.answer {
  margin-top: 8px;
  display: grid;
  gap: 10px;
}

.input-wrap {
  display: grid;
  gap: 6px;
}

input {
  padding: 10px 12px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 220px;
}

input.correct {
  border-color: #16a34a;
}

input.wrong {
  border-color: #dc2626;
  animation: shake 0.18s linear 2;
}

.actions {
  display: flex;
  gap: 8px;
}

button {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #fff;
}

button.next {
  background: #f7f7f7;
}

.ok {
  color: #16a34a;
}

.err {
  color: #dc2626;
}

@keyframes shake {
  0% { transform: translateX(0) }
  25% { transform: translateX(-2px) }
  50% { transform: translateX(2px) }
  75% { transform: translateX(-2px) }
  100% { transform: translateX(0) }
}
</style>
