import type { StatsBucket } from '../stats/stats.types'

/**
 * Session：一次连续训练的总结数据
 */
export interface Session {
  /** Session 唯一标识 */
  sessionId: string
  userEmail: string
  /** 用户唯一标识 */
  userId: string

  /** 训练大类，例如：chip / board / bigo */
  mode: string

  /** 训练子类型，例如：cash / tournament / omaha / bridge */
  subMode: string

  /** 本次训练开始时间（时间戳，毫秒） */
  startAt: number

  /** 本次训练结束时间（时间戳，毫秒） */
  endAt: number

  /** 本次训练持续总时长（毫秒） */
  durationMs: number

  /** 本次训练完成的题目总数 */
  totalCount: number

  /** 本次训练中答对的题目数量 */
  correctCount: number

  /** 本次训练中答错的题目数量 */
  wrongCount: number

  /** 本次训练正确率（correctCount / totalCount） */
  accuracy: number

  /** 本次训练平均答题时间（毫秒） */
  avgAnswerTimeMs: number

  /** 本次训练答题时间中位数（毫秒） */
  medianAnswerTimeMs: number

  /**
   * 本次训练的扩展统计结果
   * 所有维度的统计最终都会收敛到这里
   */
  stats: StatsBucket[]

  /** 本次训练发生的时间段（morning / afternoon / evening / night） */
  timeSlot: string

  /**
   * 是否为完整 Session
   * true：正常结束
   * false：Beacon 等兜底方式保存
   */
  isComplete: boolean

  /** 本条 Session 数据写入时间（时间戳，毫秒） */
  createdAt: number
}
