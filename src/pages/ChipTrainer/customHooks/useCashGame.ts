import { CHIP_TYPES, splitWhiteStacks, splitRedStacks, splitGreenStacks, splitYellow1kStacks, splitRed5kStacks, splitGreen25kStacks } from '../utils/chipUtils'

/**
 * 现金桌颜色类型
 */
export type CashColor =
  | 'white1'
  | 'red5'
  | 'green25'
  | 'black100'
  | 'pink2'
  | 'purple500'
  | 'brown3'
  | 'yellow1k'
  | 'red5k'
  | 'green25k'

/**
 * 单个筹码上限配置
 * key = 颜色语义（已与你给的最终规则对齐）
 */
export interface CashChipLimits {
  white1: number // 白色 1
  red5: number // 红色 5
  green25: number // 绿色 25
  pink2: number // 粉色 2
  black100: number // 黑色 100
  purple500: number // 紫色 500
  brown3: number // 棕色 3
  yellow1k: number // 黄色 1k
  red5k: number // 红色 5k
  green25k: number // 绿色 25k
}

/**
 * 单个筹码下限配置
 */
export interface CashChipMinLimits {
  white1: number
  red5: number
  green25: number
  pink2: number
  black100: number
  purple500: number
  brown3: number
  yellow1k: number
  red5k: number
  green25k: number
}

/**
 * Cash Game Config
 */
export interface CashGameConfig {
  enabledColors: CashColor[]
  limits: CashChipLimits
  minLimits?: CashChipMinLimits
}

/**
 * 现金赛出题引擎
 */
export function useCashGame(config: CashGameConfig) {
  function randomCount(min: number, max: number) {
    if (max <= 0) return 0
    const actualMin = Math.max(0, min)
    const actualMax = Math.max(actualMin, max)
    return Math.floor(Math.random() * (actualMax - actualMin + 1)) + actualMin
  }

  function generate() {
    const groups: { color: CashColor; count: number }[] = []
    let total = 0

    const { enabledColors, limits, minLimits } = config

    // 辅助函数：获取某个颜色的最小值
    const getMin = (color: keyof CashChipLimits) => {
      return minLimits?.[color] ?? 0
    }

    /* ================= 白色（1）================= */
    if (enabledColors.includes('white1')) {
      const count = randomCount(getMin('white1'), limits.white1)
      if (count > 0) {
        splitWhiteStacks(count).forEach((c) => {
          groups.push({ color: 'white1', count: c })
        })
        total += count * 1
      }
    }

    /* ================= 红色（5）================= */
    if (enabledColors.includes('red5')) {
      const count = randomCount(getMin('red5'), limits.red5)
      if (count > 0) {
        const choice = Math.random() < 0.5 ? 4 : 5
        splitRedStacks(count, choice).forEach((c) => {
          groups.push({ color: 'red5', count: c })
        })
        total += count * 5
      }
    }

    /* ================= 绿色（25）================ */
    if (enabledColors.includes('green25')) {
      const count = randomCount(getMin('green25'), limits.green25)
      if (count > 0) {
        splitGreenStacks(count).forEach((c) => {
          groups.push({ color: 'green25', count: c })
        })
        total += count * 25
      }
    }

    /* ================= 粉色（2）================ */
    if (enabledColors.includes('pink2')) {
      const count = randomCount(getMin('pink2'), limits.pink2)
      if (count > 0) {
        splitWhiteStacks(count).forEach((c) => {
          groups.push({ color: 'pink2', count: c })
        })
        total += count * 2
      }
    }

    /* ================= 黑色（100）=============== */
    if (enabledColors.includes('black100')) {
      const count = randomCount(getMin('black100'), limits.black100)
      if (count > 0) {
        splitWhiteStacks(count).forEach((c) => {
          groups.push({ color: 'black100', count: c })
        })
        total += count * 100
      }
    }

    /* ================= 紫色（500）=============== */
    if (enabledColors.includes('purple500')) {
      const count = randomCount(getMin('purple500'), limits.purple500)
      if (count > 0) {
        splitWhiteStacks(count).forEach((c) => {
          groups.push({ color: 'purple500', count: c })
        })
        total += count * 500
      }
    }

    /* ================= 棕色（3）================ */
    if (enabledColors.includes('brown3')) {
      const count = randomCount(getMin('brown3'), limits.brown3)
      if (count > 0) {
        splitWhiteStacks(count).forEach((c) => {
          groups.push({ color: 'brown3', count: c })
        })
        total += count * 3
      }
    }

    /* ================= 黄色（1k）================ */
    if (enabledColors.includes('yellow1k')) {
      const count = randomCount(getMin('yellow1k'), limits.yellow1k)
      if (count > 0) {
        splitYellow1kStacks(count).forEach((c) => {
          groups.push({ color: 'yellow1k', count: c })
        })
        total += count * 1000
      }
    }

    /* ================= 红色（5k）================ */
    if (enabledColors.includes('red5k')) {
      const count = randomCount(getMin('red5k'), limits.red5k)
      if (count > 0) {
        splitRed5kStacks(count).forEach((c) => {
          groups.push({ color: 'red5k', count: c })
        })
        total += count * 5000
      }
    }

    /* ================= 绿色（25k）================ */
    if (enabledColors.includes('green25k')) {
      const count = randomCount(getMin('green25k'), limits.green25k)
      if (count > 0) {
        splitGreen25kStacks(count).forEach((c) => {
          groups.push({ color: 'green25k', count: c })
        })
        total += count * 25000
      }
    }

    /* ================= 排序（大 → 小）================ */
    const ORDER: CashColor[] = [
      'green25k',
      'red5k',
      'yellow1k',
      'purple500',
      'black100',
      'green25',
      'red5',
      'brown3',
      'pink2',
      'white1',
    ]
    groups.sort((a, b) => ORDER.indexOf(a.color) - ORDER.indexOf(b.color))

    return { groups, total }
  }

  return { generate }
}
