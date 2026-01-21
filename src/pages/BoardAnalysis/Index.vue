<script setup lang="ts">
  import { ref, onMounted, watch, nextTick, computed } from 'vue'
  import bg from '@/assets/bg/pokeboard.png?url'
  import { ElMessage } from 'element-plus'
  import { Hand } from 'pokersolver'
  import BoardConfigBar from './components/BoardConfigBar.vue'
  import CardFace from '@/components/cards/CardFace.vue'
  import CardStack from '@/components/cards/CardStack.vue'

  /* =============================== 基础状态 =============================== */

  const SNAP_DISTANCE = 50
  const playerCount = ref<number>(2)

  const boardCards = ref<string[]>([])
  const playerHands = ref<Record<number, string[]>>({})

  /* =============================== HIGH 状态 =============================== */

  type HighChip = {
    x: number
    y: number
    homeX: number
    homeY: number
    anchorIndex: number | null
  }

  const CHIP_COUNT = 8
  const highChips = ref<HighChip[]>([])
  const draggingChipIndex = ref<number | null>(null)

  /* =============================== 结果弹窗 =============================== */

  const showResult = ref(false)
  const resultMessage = ref('')

  /* =============================== 派生状态 =============================== */

  const activeSeatSet = computed(() => {
    const set = new Set<number>()
    highChips.value.forEach((chip) => {
      if (chip.anchorIndex !== null) set.add(chip.anchorIndex)
    })
    return set
  })

  const hasSelection = computed(() => activeSeatSet.value.size > 0)

  /** ✅ 多选：你选择的所有玩家 */
  const selectedSeats = computed<number[]>(() => {
    return highChips.value
      .filter((chip) => chip.anchorIndex !== null)
      .map((chip) => chip.anchorIndex! + 1)
      .sort((a, b) => a - b)
  })

  /* =============================== solver 适配 =============================== */

  function toSolverCard(card: string): string {
    const suit = card.slice(-1)
    const rawRank = card.slice(0, -1)

    const rankMap: Record<string, string> = {
      a: 'A',
      k: 'K',
      q: 'Q',
      j: 'J',
      '10': 'T',
      '9': '9',
      '8': '8',
      '7': '7',
      '6': '6',
      '5': '5',
      '4': '4',
      '3': '3',
      '2': '2',
    }

    return rankMap[rawRank] + suit
  }

  /* =============================== 发牌 =============================== */

  const suits = ['s', 'h', 'd', 'c']
  const ranks = ['a', 'k', 'q', 'j', '10', '9', '8', '7', '6', '5', '4', '3', '2']
  const fullDeck = suits.flatMap((s) => ranks.map((r) => `${r}${s}`))

  function shuffle<T>(arr: T[]) {
    return [...arr].sort(() => Math.random() - 0.5)
  }

  function dealNewHand() {
    const deck = shuffle(fullDeck)

    boardCards.value = deck.splice(0, 5)

    const hands: Record<number, string[]> = {}
    for (let seat = 1; seat <= playerCount.value; seat++) {
      hands[seat] = deck.splice(0, 4)
    }
    playerHands.value = hands

    // reset HIGH（不动 home）
    highChips.value.forEach((chip) => {
      chip.x = chip.homeX
      chip.y = chip.homeY
      chip.anchorIndex = null
    })
  }

  function handleNextQuestion() {
    showResult.value = false
    dealNewHand()
  }

  /* =============================== HIGH 初始化 =============================== */

  function initHighChips() {
    highChips.value = Array.from({ length: CHIP_COUNT }, () => ({
      x: 0,
      y: 0,
      homeX: 0,
      homeY: 0,
      anchorIndex: null,
    }))
  }

  function onHighDoubleClick(index: number) {
    const chip = highChips.value[index]
    chip.x = chip.homeX
    chip.y = chip.homeY
    chip.anchorIndex = null
  }

  /* =============================== Anchor refs =============================== */

  const boardRef = ref<HTMLElement | null>(null)
  const anchorRangeRefs = ref<HTMLElement[]>([])
  const anchorPointRefs = ref<HTMLElement[]>([])

  function refreshAnchors() {
    if (!boardRef.value) return

    anchorRangeRefs.value = Array.from(
      boardRef.value.querySelectorAll('.anchor-range')
    ) as HTMLElement[]

    anchorPointRefs.value = Array.from(
      boardRef.value.querySelectorAll('.player-anchor')
    ) as HTMLElement[]
  }

  /* =============================== 拖拽 =============================== */

  function distancePointToRect(px: number, py: number, rect: DOMRect) {
    const dx = Math.max(rect.left - px, 0, px - rect.right)
    const dy = Math.max(rect.top - py, 0, py - rect.bottom)
    return Math.sqrt(dx * dx + dy * dy)
  }

  function getAnchorCenter(range: HTMLElement, anchor: HTMLElement) {
    const r = range.getBoundingClientRect()
    const a = anchor.getBoundingClientRect()
    return {
      x: a.left - r.left + a.width / 2 + r.left,
      y: a.top - r.top + a.height / 2 + r.top,
    }
  }

  function onHighMouseDown(index: number, e: MouseEvent) {
    draggingChipIndex.value = index
    e.preventDefault()
  }

  function onMouseMove(e: MouseEvent) {
    if (draggingChipIndex.value === null || !boardRef.value) return
    const rect = boardRef.value.getBoundingClientRect()
    const chip = highChips.value[draggingChipIndex.value]

    chip.x = Math.max(0, Math.min(e.clientX - rect.left - 22, rect.width - 44))
    chip.y = Math.max(0, Math.min(e.clientY - rect.top - 12, rect.height - 24))
  }

  function onMouseUp() {
    if (draggingChipIndex.value === null || !boardRef.value) return

    const chip = highChips.value[draggingChipIndex.value]
    draggingChipIndex.value = null

    const boardRect = boardRef.value.getBoundingClientRect()
    const cx = chip.x + boardRect.left + 22
    const cy = chip.y + boardRect.top + 12

    let nearest: number | null = null
    let min = Infinity

    anchorRangeRefs.value.forEach((range, i) => {
      const d = distancePointToRect(cx, cy, range.getBoundingClientRect())
      if (d < min) {
        min = d
        nearest = i
      }
    })

    if (nearest !== null && min <= SNAP_DISTANCE) {
      highChips.value.forEach((c) => {
        if (c.anchorIndex === nearest) {
          c.x = c.homeX
          c.y = c.homeY
          c.anchorIndex = null
        }
      })

      const { x, y } = getAnchorCenter(
        anchorRangeRefs.value[nearest],
        anchorPointRefs.value[nearest]
      )

      chip.x = x - boardRect.left - 22
      chip.y = y - boardRect.top - 12
      chip.anchorIndex = nearest
    } else {
      chip.anchorIndex = null
    }
  }

  /* =============================== 判定（严格） =============================== */

  function checkAnswer() {
    if (selectedSeats.value.length === 0) {
      ElMessage.warning('Please select the winning player(s) first')
      return
    }

    const solved = Object.entries(playerHands.value).map(([seat, cards]) => ({
      seat: Number(seat),
      hand: Hand.solve([...cards, ...boardCards.value].map(toSolverCard)),
    }))

    const winners = Hand.winners(solved.map((s) => s.hand))
    const winnerSeats = solved
      .filter((s) => winners.includes(s.hand))
      .map((s) => s.seat)
      .sort((a, b) => a - b)

    const isCorrect =
      winnerSeats.length === selectedSeats.value.length &&
      winnerSeats.every((seat, i) => seat === selectedSeats.value[i])
    const winnerDetails = solved
      .filter((s) => winnerSeats.includes(s.seat))
      .map((s) => `Player ${s.seat}: ${s.hand.descr}`)
      .join('\n')
    if (isCorrect) {
      ElMessage.success('Correct! 🎉')
      setTimeout(dealNewHand, 1200)
    } else {
      resultMessage.value =
        `Wrong ❌\n\n` +
        `Correct winner(s): ${winnerSeats.join(', ')}\n\n` +
        `Winning hand(s):\n${winnerDetails}\n\n` +
        `Your answer: ${selectedSeats.value.join(', ') || 'None'}`
      showResult.value = true
    }
  }

  /* =============================== 生命周期 =============================== */

  onMounted(async () => {
    initHighChips()
    dealNewHand()

    await nextTick()

    boardRef.value = document.querySelector('.board')
    refreshAnchors()

    const rect = boardRef.value!.getBoundingClientRect()
    const baseX = rect.width - 70
    const baseY = 30

    highChips.value.forEach((chip, i) => {
      chip.x = baseX + i * 3
      chip.y = baseY + i * 2
      chip.homeX = chip.x
      chip.homeY = chip.y
    })

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  })

  watch(playerCount, async () => {
    dealNewHand()
    await nextTick()
    refreshAnchors()
  })
</script>

<template>
  <el-dialog v-model="showResult" title="Wrong Answer" width="420px" :close-on-click-modal="false">
    <pre style="white-space: pre-wrap; line-height: 1.6"
      >{{ resultMessage }}
  </pre
    >

    <template #footer>
      <el-button @click="showResult = false"> I got it </el-button>
      <el-button type="primary" @click="handleNextQuestion"> Next Hand </el-button>
    </template>
  </el-dialog>

  <div class="ui-page">
    <div class="ui-stage">
      <div class="ui-panel trainer-header">
        <h1 class="page-title">牌面分析训练</h1>
      </div>

      <BoardConfigBar
        @change-player-count="(n) => (playerCount = n)"
        @submit="checkAnswer"
        @next="handleNextQuestion"
      />

      <!-- 训练舞台 -->
      <div class="chip-stage board" ref="boardRef" :style="{ backgroundImage: `url(${bg})` }">
        <div class="board-overlay">
          <!-- 公共牌 -->
          <div class="community-cards-group">
            <div
              v-for="(card, i) in boardCards"
              :key="i"
              class="community-card"
              :class="`card-${i}`"
            >
              <CardFace :card="card" :scale="0.75" />
            </div>
          </div>

          <!-- 牌堆 -->
          <div class="deck">
            <CardStack :count="16" :scale="0.7" />
          </div>

          <!-- 玩家手牌 -->
          <div v-for="seat in playerCount" :key="seat" class="player-area" :class="`seat-${seat}`">
            <div class="player-hand" v-if="playerHands[seat]">
              <div
                v-for="(card, i) in playerHands[seat]"
                :key="i"
                class="hand-card"
                :style="{ left: `${i * 18}px`, zIndex: i }"
              >
                <CardFace
                  :card="card"
                  :scale="0.6"
                  :active="activeSeatSet.has(seat - 1)"
                  :has-selection="hasSelection"
                />
              </div>
            </div>
          </div>

          <!-- 绿色圈（保留） -->
          <div
            v-for="seat in playerCount"
            class="anchor-range"
            :key="`anchor-range-${seat}`"
            :class="`anchor-range-${seat}`"
          >
            <div class="player-anchor" :class="`anchor-${seat}`">
              <!-- {{ seat }} -->
            </div>
          </div>

          <!-- HIGH Buttons -->
          <div
            v-for="(chip, index) in highChips"
            :key="index"
            class="high-chip"
            :style="{ transform: `translate(${chip.x}px, ${chip.y}px)` }"
            @mousedown="onHighMouseDown(index, $event)"
            @dblclick="onHighDoubleClick(index)"
          >
            HIGH
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* ===============================
 牌桌
 =============================== */

  .board {
    position: relative;
    height: 600px;
    margin-top: 16px;
    background-repeat: no-repeat;
    background-size: 125% auto;
    background-position: center 55%;
  }

  .board-overlay {
    position: absolute;
    inset: 0;
  }

  /* ===============================
 公共牌 & 牌堆
 =============================== */

  .community-cards-group {
    position: absolute;
    top: 38%;
    left: 50%;
    transform: translateX(-50%);
    width: 260px;
    height: 100px;
  }

  .deck {
    position: absolute;
    bottom: 67px;
    left: 50%;
    transform: translateX(-50%);
    transform: scale(0.85);
  }

  /* ===============================
 玩家手牌
 =============================== */

  .player-area {
    position: absolute;
  }

  .player-hand {
    position: relative;
    height: 90px;
  }

  .hand-card {
    position: absolute;
    top: 0;
  }

  /* ===============================
 玩家吸附锚点（绿色）
 =============================== */

  .player-anchor {
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    opacity: 0.85;
    pointer-events: none;
    z-index: 100;
  }

  .anchor-range {
    position: absolute;
    width: 121px;
    height: 106px;
  }
  .seat-1 {
    bottom: 20%;
    left: 22%;
  }
  .anchor-range-1 {
    bottom: 17%;
    left: 23%;
  }
  .anchor-1 {
    bottom: 85%;
    left: 25%;
  }

  .seat-2 {
    bottom: 39%;
    left: 13%;
    transform: rotateZ(50deg);
  }
  .anchor-range-2 {
    bottom: 28%;
    left: 11%;
    transform: rotateZ(50deg);
  }
  .anchor-2 {
    top: -37px;
    left: 35px;
  }

  .seat-3 {
    top: 17%;
    left: 20%;
    transform: rotateZ(124deg);
  }
  .anchor-range-3 {
    top: 23%;
    left: 12%;
    transform: rotateZ(124deg);
  }
  .anchor-3 {
    top: -37px;
    left: 35px;
  }
  .seat-4 {
    top: 10%;
    left: 28%;
  }
  .anchor-range-4 {
    top: 14%;
    left: 29%;
  }
  .anchor-4 {
    top: 93px;
    left: 41px;
  }

  .seat-5 {
    top: 10%;
    left: 62%;
  }
  .anchor-range-5 {
    top: 14%;
    left: 63%;
  }
  .anchor-5 {
    top: 93px;
    left: 41px;
  }
  .seat-6 {
    top: 14%;
    left: 80%;
    transform: rotateZ(45deg);
  }
  .anchor-range-6 {
    top: 24%;
    right: 13%;
    transform: rotateZ(224deg);
  }
  .anchor-6 {
    top: -31px;
    left: 35px;
  }
  .seat-7 {
    top: 62%;
    right: 17%;
    transform: rotateZ(-63deg);
  }
  .anchor-range-7 {
    top: 301px;
    right: 141px;
    transform: rotateZ(27deg);
  }
  .anchor-7 {
    top: 26px;
    left: -35px;
  }

  .seat-8 {
    bottom: 20%;
    right: 32%;
  }
  .anchor-range-8 {
    bottom: 17%;
    right: 317px;
  }
  .anchor-8 {
    top: -36px;
    left: 35px;
  }

  /* ===============================
 八个座位定位
 =============================== */

  /* ===============================
 公共牌位置
 =============================== */

  .community-card {
    position: absolute;
    top: 0;
  }

  .community-card.card-0 {
    left: 0px;
    z-index: 1;
  }
  .community-card.card-1 {
    left: 46px;
    z-index: 2;
  }
  .community-card.card-2 {
    left: 92px;
    z-index: 3;
  }
  .community-card.card-3 {
    left: 138px;
    z-index: 4;
  }
  .community-card.card-4 {
    left: 184px;
    z-index: 5;
  }

  .high-chip {
    position: absolute;
    width: 44px;
    height: 44px;
    background: #d32f2f;
    color: #fff;
    border-radius: 50%;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    z-index: 1000;
  }
</style>
