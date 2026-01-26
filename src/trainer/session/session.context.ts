import type { StatsBucket } from '../stats/stats.types'
type SessionState = 'active' | 'finalizing' | 'persisted'
/**
 * SessionContext
 * 前端练习进行中的临时数据结构
 * 只存在于内存，不直接入库
 */
export interface SessionContext {
  /** 当前 session 的唯一标识 */
  sessionId: string

  /** 用户唯一标识 */
  userId: string
  userEmail: string | null
  /** 训练大类 */
  mode: string

  /** 训练子类型 */
  subMode: string

  /** Session 开始时间（毫秒时间戳） */
  startAt: number

  /** 已完成题目数量 */
  totalCount: number

  /** 已答对题目数量 */
  correctCount: number

  /** 已答错题目数量 */
  wrongCount: number

  /** 每一题的答题耗时（毫秒），用于算平均 / 中位数 */
  answerTimes: number[]

  /** 动态统计桶（不断往里累加） */
  stats: StatsBucket[]
  /** Session 级明细事件（错题、回放等），用于 flush 时持久化 */
  details: unknown[]
  /** Session 当前状态（仅前端内存态使用） */
  state: SessionState
}
