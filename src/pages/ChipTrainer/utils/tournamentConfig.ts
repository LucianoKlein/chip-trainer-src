/**
 * 锦标赛筹码颜色类型
 * —— 与 index.vue / useTournamentGame / Chip.vue 完全一致
 */
export type TournamentColor =
  | 'black100'
  | 'purple500'
  | 'yellow1k'
  | 'red5k'
  | 'green25k'
  | 'blue100k'
  | 'pink500k'
  | 'orange1m'
  | 'grey5m'

/**
 * 锦标赛筹码定义表
 * - value：单枚筹码面额
 * - smallGroup：拆堆时的小组单位（用于视觉 & 认知）
 */
export const TOURNAMENT_CHIPS: Record<
  TournamentColor,
  {
    value: number
    smallGroup: number
  }
> = {
  /* ===== 小面额 ===== */
  black100: {
    value: 100,
    smallGroup: 5,
  },
  purple500: {
    value: 500,
    smallGroup: 4,
  },
  yellow1k: {
    value: 1000,
    smallGroup: 5,
  },
  red5k: {
    value: 5000,
    smallGroup: 5,
  },
  green25k: {
    value: 25000,
    smallGroup: 4,
  },

  /* ===== 大面额（新增，已在首页配置）===== */
  blue100k: {
    value: 100000,
    smallGroup: 5,
  },
  pink500k: {
    value: 500000,
    smallGroup: 4,
  },
  orange1m: {
    value: 1_000_000,
    smallGroup: 5,
  },
  grey5m: {
    value: 5_000_000,
    smallGroup: 5,
  },
}
