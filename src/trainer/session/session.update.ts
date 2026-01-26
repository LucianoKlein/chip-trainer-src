import type { SessionContext } from './session.context'
import type { StatsBucket } from '../stats/stats.types'

interface UpdateSessionPayload {
  /** 本题是否答对 */
  isCorrect: boolean

  /** 本题答题耗时（毫秒） */
  answerTimeMs: number

  /** 本题产生的统计数据（已经算好） */
  stats?: StatsBucket[]
}

/**
 * 用户完成一道题后，更新 SessionContext
 */
export function updateSessionContext(context: SessionContext, payload: UpdateSessionPayload) {
  // 题目总数 +1
  context.totalCount += 1

  // 记录答题时间
  context.answerTimes.push(payload.answerTimeMs)

  // 正确 / 错误计数
  if (payload.isCorrect) {
    context.correctCount += 1
  } else {
    context.wrongCount += 1
  }

  // 合并统计桶（如果有）
  if (payload.stats && payload.stats.length > 0) {
    context.stats.push(...payload.stats)
  }
  console.log('[session update]', {
    total: context.totalCount,
    correct: context.correctCount,
    wrong: context.wrongCount,
  })
}
