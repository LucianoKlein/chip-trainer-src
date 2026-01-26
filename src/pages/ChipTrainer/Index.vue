<script setup lang="ts">
  import { ref, computed, watch } from 'vue'

  import TournamentAnswerInput from './components/TournamentAnswerInput.vue'
  import GameConfigPanel from './components/GameConfigPanel.vue'
  import ChipBoard from './components/ChipBoard.vue'
  import AnswerActions from './components/AnswerActions.vue'

  import { useTournamentGame } from './customHooks/useTournamentGame'
  import { CashColor, useCashGame } from './customHooks/useCashGame'
  import { TournamentColor } from './utils/tournamentConfig'

  import useChipTrainingI18n from '../../i18n/customHook/chipTraining/useChipTraining'
  import useUISystem from '@/i18n/customHook/UI/useUISystem'

  import { useUserStore } from '@/stores/user'
  import { update, initSession, flush, addDetail } from '@/trainer'
  import { createSessionContext } from '@/trainer/session/session.create'

  /* ================= i18n ================= */
  const {
    pageTitle,
    chipConfig,
    chipLimitConfig,
    cashGame,
    tournamentGame,
    white,
    red,
    green,
    black,
    purple,
    inputPlaceholder,
    gold,
    pink,
    brown,
    orange,
    grey,
    blue,
  } = useChipTrainingI18n()

  const { save, cancel } = useUISystem()

  /* ================= store ================= */
  const userStore = useUserStore()

  /* ================= 基础状态 ================= */
  const tournamentInputRef = ref<InstanceType<typeof TournamentAnswerInput> | null>(null)

  const round = ref(0) // UI 展示用
  const answeredCount = ref(0) // 业务用（关键）
  const questionStartAt = ref(Date.now())

  const chipGroups = ref<any[]>([])
  const correctValue = ref(0)
  const userInput = ref('')
  const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')

  const wrongDetails = ref<any[]>([])

  /* ================= 模式 ================= */
  const gameType = ref<'cash' | 'tournament'>('cash')

  const tournamentColors = ref<TournamentColor[]>([
    'green25k',
    'black100',
    'purple500',
    'yellow1k',
    'red5k',
    'grey5m',
    'orange1m',
    'blue100k',
  ])

  const enabledColors = ref<CashColor[]>([
    'white1',
    'red5',
    'green25',
    'black100',
    'pink2',
    'purple500',
    'brown3',
  ])

  const showAnswer = ref(false)
  const showChipConfig = ref(false)

  /* ================= 筹码配置 ================= */
  const cashChipLimits = ref({
    white1: 100,
    red5: 100,
    green25: 100,
    black100: 100,
    pink2: 100,
    purple500: 100,
    brown3: 100,
  })

  const tournamentChipLimits = ref({
    green25k: 100,
    black100: 100,
    purple500: 100,
    yellow1k: 100,
    red5k: 100,
    blue100k: 100,
    orange1m: 20,
    grey5m: 20,
  })

  /* ================= 出题 ================= */
  function newRound() {
    round.value++
    userInput.value = ''
    feedback.value = 'idle'

    const { groups, total } = gameEngine.value.generate()
    chipGroups.value = groups as any
    correctValue.value = total
    showAnswer.value = false
    questionStartAt.value = Date.now()
  }

  /* ================= 保存配置 ================= */
  function saveChipConfig() {
    showChipConfig.value = false
    userInput.value = ''
    feedback.value = 'idle'

    if (gameType.value === 'tournament') {
      tournamentInputRef.value?.reset()
    }

    newRound()
  }

  /* ================= 核心：提交答案 ================= */
  function onSubmit() {
    const val = Number(userInput.value)

    const isCorrect =
      gameType.value === 'tournament'
        ? val * 100 === correctValue.value
        : val === correctValue.value

    feedback.value = isCorrect ? 'correct' : 'wrong'

    if (gameType.value === 'tournament') {
      tournamentInputRef.value?.reset()
    } else {
      userInput.value = ''
    }

    if (!isCorrect) {
      const detail = {
        category: 'chip_trainer',
        key: 'wrong_case',
        payload: {
          userAnswer: val,
          correctValue: correctValue.value,
          chipGroups: chipGroups.value,
        },
        createdAt: Date.now(),
        mode: 'chip',
        subMode: gameType.value,
      }

      wrongDetails.value.push(detail)
      addDetail(detail)
    }

    const answerTimeMs = Date.now() - questionStartAt.value

    update({
      isCorrect,
      answerTimeMs,
    })

    answeredCount.value++

    // ===== 10 题一个 Session（UI 同步）=====
    if (answeredCount.value % 10 === 0) {
      wrongDetails.value = []
    }

    if (isCorrect) {
      setTimeout(newRound, 700)
    }
  }

  function toggleShowAnswer() {
    showAnswer.value = !showAnswer.value
  }

  /* ================= gameType 切换 = Session 边界 ================= */
  watch(gameType, async (type) => {
    // 1️⃣ 切模式前：强制落库（哪怕不足 10 题）
    if (answeredCount.value > 0) {
      await flush(true)
    }

    // 2️⃣ UI & 状态重置
    answeredCount.value = 0
    wrongDetails.value = []
    userInput.value = ''
    feedback.value = 'idle'

    // 3️⃣ 开一个全新的 Session
    const profile = userStore.profile
    if (profile) {
      initSession(createSessionContext({ uid: profile.uid, email: profile.email }, 'chip', type))
    }

    if (type === 'tournament') {
      tournamentInputRef.value?.reset()
    }

    newRound()
  })

  /* ================= 颜色切换只影响出题 ================= */
  watch(
    [enabledColors, tournamentColors],
    () => {
      userInput.value = ''
      feedback.value = 'idle'

      if (gameType.value === 'tournament') {
        tournamentInputRef.value?.reset()
      }

      newRound()
    },
    { deep: true }
  )

  /* ================= 游戏引擎 ================= */
  const gameEngine = computed(() => {
    return gameType.value === 'tournament'
      ? useTournamentGame({
          colors: tournamentColors.value,
          limits: tournamentChipLimits.value,
        })
      : useCashGame({
          enabledColors: enabledColors.value,
          limits: cashChipLimits.value,
        })
  })

  /* ================= 初始化 Session（来自 store） ================= */
  watch(
    () => userStore.profile,
    (profile) => {
      if (!profile) return

      initSession(
        createSessionContext({ uid: profile.uid, email: profile.email }, 'chip', gameType.value)
      )
    },
    { immediate: true }
  )

  newRound()
</script>

<template>
  <div class="ui-page">
    <div class="ui-stage">
      <div class="ui-stage chip-trainer">
        <!-- 顶部：标题 + 配置（Panel） -->
        <div class="ui-panel trainer-header">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <el-button type="primary" @click="showChipConfig = true">
            {{ chipLimitConfig }}
          </el-button>
        </div>

        <!-- 游戏配置（控制面板） -->
        <GameConfigPanel
          v-model:gameType="gameType"
          v-model:enabledColors="enabledColors"
          v-model:tournamentColors="tournamentColors"
        />

        <section class="chip-stage">
          <ChipBoard :groups="chipGroups" />
        </section>

        <!-- 答题区（Panel） -->
        <div class="ui-panel answer-panel">
          <section v-if="gameType === 'cash'" class="answer">
            <el-input
              v-model="userInput"
              :placeholder="inputPlaceholder"
              size="large"
              input-style="text-align: center; font-size: 20px;"
              @keyup.enter="onSubmit"
              :class="feedback"
            />

            <AnswerActions
              :feedback="feedback as any"
              :showAnswer="showAnswer"
              :correctValue="correctValue"
              @submit="onSubmit"
              @next="newRound"
              @toggleAnswer="toggleShowAnswer"
            />
          </section>

          <section v-if="gameType === 'tournament'" class="answer">
            <TournamentAnswerInput ref="tournamentInputRef" v-model="userInput" :length="7" />

            <AnswerActions
              :feedback="feedback as any"
              :showAnswer="showAnswer"
              :correctValue="correctValue"
              @submit="onSubmit"
              @next="newRound"
              @toggleAnswer="toggleShowAnswer"
            />
          </section>
        </div>
      </div>
    </div>
  </div>
  <el-dialog v-model="showChipConfig" :title="chipConfig" width="640px" align-center>
    <!-- Dialog 内容体 -->
    <div class="ui-dialog-body">
      <!-- ========== 现金赛配置 ========== -->
      <section class="config-section">
        <h3 class="config-title">{{ cashGame }}</h3>

        <div class="config-grid">
          <div class="config-item">
            <span class="config-label">{{ white }} (1)</span>
            <el-input-number v-model="cashChipLimits.white1" :min="0" :max="1000" />
          </div>
          <div class="config-item">
            <span class="config-label">{{ pink }}(2)</span>
            <el-input-number v-model="cashChipLimits.pink2" :min="0" :max="1000" />
          </div>
          <div class="config-item">
            <span class="config-label">{{ brown }}(3)</span>
            <el-input-number v-model="cashChipLimits.brown3" :min="0" :max="1000" />
          </div>
          <div class="config-item">
            <span class="config-label">{{ red }} (5)</span>
            <el-input-number v-model="cashChipLimits.red5" :min="0" :max="1000" />
          </div>
          <div class="config-item">
            <span class="config-label">{{ green }} (25)</span>
            <el-input-number v-model="cashChipLimits.green25" :min="0" :max="1000" />
          </div>
          <div class="config-item">
            <span class="config-label">{{ black }} (100)</span>
            <el-input-number v-model="cashChipLimits.black100" :min="0" :max="1000" />
          </div>
          <div class="config-item">
            <span class="config-label">{{ purple }} (500)</span>
            <el-input-number v-model="cashChipLimits.purple500" :min="0" :max="1000" />
          </div>
        </div>
      </section>

      <el-divider />

      <!-- ========== 锦标赛配置 ========== -->
      <!-- ========== 锦标赛配置 ========== -->
      <section class="config-section">
        <h3 class="config-title">{{ tournamentGame }}</h3>

        <div class="config-grid">
          <!-- 可多枚的低面额筹码 -->
          <div class="config-item">
            <span class="config-label">{{ green }} (25k)</span>
            <el-input-number v-model="tournamentChipLimits.green25k" :min="0" :max="1000" />
          </div>

          <div class="config-item">
            <span class="config-label">{{ black }} (100)</span>
            <el-input-number v-model="tournamentChipLimits.black100" :min="0" :max="1000" />
          </div>

          <!-- ===== 稀有筹码：只能 0 / 1 ===== -->

          <div class="config-item">
            <span class="config-label">{{ purple }} (500)</span>
            <el-input-number v-model="tournamentChipLimits.purple500" :min="0" :max="1000" />
          </div>

          <div class="config-item">
            <span class="config-label">{{ gold }} (1k)</span>
            <el-input-number v-model="tournamentChipLimits.yellow1k" :min="0" :max="1000" />
          </div>

          <div class="config-item">
            <span class="config-label">{{ red }} (5k)</span>
            <el-input-number v-model="tournamentChipLimits.red5k" :min="0" :max="1000" />
          </div>

          <div class="config-item">
            <span class="config-label">{{ blue }} (100k)</span>
            <el-input-number v-model="tournamentChipLimits.blue100k" :min="0" :max="1000" />
          </div>

          <div class="config-item">
            <span class="config-label">{{ orange }} (1M)</span>
            <el-input-number v-model="tournamentChipLimits.orange1m" :min="0" :max="20" />
          </div>

          <div class="config-item">
            <span class="config-label">{{ grey }} (5M)</span>
            <el-input-number v-model="tournamentChipLimits.grey5m" :min="0" :max="20" />
          </div>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <template #footer>
      <el-button @click="showChipConfig = false">
        {{ cancel }}
      </el-button>
      <el-button type="primary" @click="saveChipConfig">
        {{ save }}
      </el-button>
    </template>
  </el-dialog>

  <!-- ========== 主体 ========== -->
  <!-- ========== 主体 ========== -->
</template>

<style scoped>
  /* 页面标题 */
  .page-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
  }

  /* 顶部 Panel */
  .trainer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
  }

  /* 答题区 Panel 内部 */
  .answer-panel {
    margin-top: var(--space-5);
  }

  /* 答题结构 */
  .answer {
    display: grid;
    gap: var(--space-3);
    justify-items: center;
  }

  /* 输入框宽度控制 */
  .el-input {
    max-width: 280px;
  }

  /* 正确 / 错误反馈（不写死颜色） */
  .el-input.correct .el-input__wrapper {
    border-color: var(--color-success);
  }

  .el-input.wrong .el-input__wrapper {
    border-color: var(--color-error);
  }

  /* 弹窗标题 */
  .config-title {
    margin: var(--space-1) 0 var(--space-2);
    font-weight: 600;
  }

  .chip-stage {
    margin: var(--space-6) 0;
    padding: var(--space-6) var(--space-4);

    /* 非卡片背景 */
    background: rgba(255, 255, 255, 0.6);

    /* 非卡片边界 */
    border-radius: 16px;

    /* 极弱托底阴影（关键） */
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.04),
      0 12px 24px rgba(0, 0, 0, 0.08);
  }
</style>
