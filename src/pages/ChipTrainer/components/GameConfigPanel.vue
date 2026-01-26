<script setup lang="ts">
  import useChipTraining from '../../../i18n/customHook/chipTraining/useChipTraining'

  const {
    cashGame,
    tournamentGame,
    gameType: tGameType,
    chipColors,
    red,
    green,
    white,
    black,
    purple,
    gold,
    pink,
    brown,
    blue,
    orange,
    grey,
  } = useChipTraining()

  defineProps<{
    gameType: 'cash' | 'tournament'

    /* cash */
    enabledColors: string[]
    whiteRange?: '1-20' | '20-60'
    cashPreset: string

    /* tournament */
    tournamentColors: string[]
    blackRange?: '1-19' | '20-60'
    tournamentPreset: string
  }>()

  const emit = defineEmits<{
    /* common */
    (e: 'update:gameType', val: 'cash' | 'tournament'): void

    /* cash */
    (e: 'update:enabledColors', val: string[]): void
    (e: 'update:whiteRange', val: '1-20' | '20-60'): void
    (e: 'update:cashPreset', val: string): void

    /* tournament */
    (e: 'update:tournamentColors', val: string[]): void
    (e: 'update:blackRange', val: '1-19' | '20-60'): void
    (e: 'update:tournamentPreset', val: string): void
  }>()
</script>

<template>
  <div class="ui-panel game-config-panel">
    <el-form label-position="top">
      <!-- 游戏类型 -->
      <el-form-item :label="tGameType">
        <el-radio-group
          :model-value="gameType"
          @update:model-value="emit('update:gameType', $event)"
        >
          <el-radio label="cash">{{ cashGame }}</el-radio>
          <el-radio label="tournament">{{ tournamentGame }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- ========== 现金赛配置 ========== -->
      <template v-if="gameType === 'cash'">
        <el-form-item label="预设">
          <el-select
            :model-value="cashPreset"
            @update:model-value="emit('update:cashPreset', $event)"
            style="width: 240px"
          >
            <el-option label="无预设" value="none" />
            <el-option label="1/3 NLH Red Rock" value="red_rock_1_3" />
            <el-option label="5/5 NLH Red Rock" value="red_rock_5_5" />
            <el-option label="1/3 NLH Wynn" value="wynn_1_3" />
            <el-option label="2/5 NLH Wynn" value="wynn_2_5" />
            <el-option label="1/3 NLH Bellagio" value="bellagio_1_3" />
            <el-option label="2/5 NLH Bellagio" value="bellagio_2_5" />
            <el-option label="Red Rock Bank" value="red_rock_bank" />
            <el-option label="Wynn Bank" value="wynn_bank" />
            <el-option label="WSOP Bank" value="wsop_bank" />
            <el-option label="Bellagio Bank" value="bellagio_bank" />
          </el-select>
        </el-form-item>

        <el-form-item :label="chipColors">
          <el-checkbox-group
            :model-value="enabledColors"
            @update:model-value="emit('update:enabledColors', $event)"
          >
            <el-space size="large">
              <el-checkbox label="white1">{{ white }} ($1)</el-checkbox>
              <el-checkbox label="pink2">{{ pink }} ($2)</el-checkbox>
              <el-checkbox label="brown3">{{ brown }} ($3)</el-checkbox>
              <el-checkbox label="red5">{{ red }} ($5)</el-checkbox>
              <el-checkbox label="green25">{{ green }} ($25)</el-checkbox>
              <el-checkbox label="black100">{{ black }} ($100)</el-checkbox>
              <el-checkbox label="purple500">{{ purple }} ($500)</el-checkbox>
              <el-checkbox label="yellow1k">{{ gold }} ($1k)</el-checkbox>
              <el-checkbox label="red5k">{{ red }} ($5k)</el-checkbox>
              <el-checkbox label="green25k">{{ green }} ($25k)</el-checkbox>
            </el-space>
          </el-checkbox-group>
        </el-form-item>
      </template>

      <!-- ========== 锦标赛配置 ========== -->
      <template v-else>
        <el-form-item label="预设">
          <el-select
            :model-value="tournamentPreset"
            @update:model-value="emit('update:tournamentPreset', $event)"
            style="width: 240px"
          >
            <el-option label="无预设" value="none" />
            <el-option label="Day 1 Early" value="day1_early" />
            <el-option label="Day 1 First Color Up" value="day1_first_color_up" />
            <el-option label="Day 1 Second Color Up" value="day1_second_color_up" />
            <el-option label="Day 2 First Color Up" value="day2_first_color_up" />
            <el-option label="Day 2 Second Color Up" value="day2_second_color_up" />
            <el-option label="Final Table" value="final_table" />
          </el-select>
        </el-form-item>

        <el-form-item :label="chipColors">
          <el-checkbox-group
            :model-value="tournamentColors"
            @update:model-value="emit('update:tournamentColors', $event)"
          >
            <el-space size="large">
              <!-- 按面额从小到大排列 -->
              <el-checkbox label="black100">{{ black }}（100）</el-checkbox>
              <el-checkbox label="purple500">{{ purple }}（500）</el-checkbox>
              <el-checkbox label="yellow1k">{{ gold }}（1k）</el-checkbox>
              <el-checkbox label="red5k">{{ red }}（5k）</el-checkbox>
              <el-checkbox label="green25k">{{ green }}（25k）</el-checkbox>
              <el-checkbox label="blue100k">{{ blue }}（100k）</el-checkbox>
              <el-checkbox label="pink500k">{{ pink }}（500k）</el-checkbox>
              <el-checkbox label="orange1m">{{ orange }}（1M）</el-checkbox>
              <el-checkbox label="grey5m">{{ grey }}（5M）</el-checkbox>
            </el-space>
          </el-checkbox-group>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<style scoped>
  .game-config-panel {
    margin-bottom: var(--space-4);
  }

  /* 表单项之间更松一点，符合“配置面板”语义 */
  .game-config-panel :deep(.el-form-item) {
    margin-bottom: var(--space-4);
  }
</style>
