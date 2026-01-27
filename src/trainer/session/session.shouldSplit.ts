import type { SessionContext } from './session.context'

interface ShouldSplitOptions {
  /** 单个 Session 最大时长（毫秒），例如 20 分钟 */
  maxDurationMs: number

  /** 多久没做题算空闲（毫秒），例如 3 分钟 */
  idleTimeoutMs: number

  /** 最近一次答题时间（毫秒时间戳） */
  lastAnswerAt: number
}

/**
 * 判断是否需要切分 Session
 */
export function shouldSplitSession(context: SessionContext, options: ShouldSplitOptions): boolean {
  const now = Date.now()

  // 规则 0：答题数量达到上限（10 题一发）
  if (context.totalCount >= 10) {
    return true
  }
  // 规则 1：Session 时长超过上限
  if (now - context.startAt >= options.maxDurationMs) {
    return true
  }

  // 规则 2：长时间未答题（空闲）
  if (now - options.lastAnswerAt >= options.idleTimeoutMs) {
    return true
  }

  return false
}
