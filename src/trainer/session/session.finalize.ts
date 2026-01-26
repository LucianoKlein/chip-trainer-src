import type { SessionContext } from './session.context'
import type { Session } from './session.types'

/**
 * 将 SessionContext 结算为 Session
 * 只做数据整理和计算，不做存储
 */
export function finalizeSession(context: SessionContext, isComplete: boolean): Session {
  if (context.state !== 'active') {
    return null as any
  }
  context.state = 'finalizing'
  const endAt = Date.now()
  const durationMs = endAt - context.startAt

  const totalCount = context.totalCount
  const correctCount = context.correctCount
  const wrongCount = context.wrongCount

  const accuracy = totalCount > 0 ? correctCount / totalCount : 0

  const avgAnswerTimeMs =
    context.answerTimes.length > 0
      ? context.answerTimes.reduce((a, b) => a + b, 0) / context.answerTimes.length
      : 0

  const sortedTimes = [...context.answerTimes].sort((a, b) => a - b)
  const medianAnswerTimeMs =
    sortedTimes.length === 0
      ? 0
      : sortedTimes.length % 2 === 1
        ? sortedTimes[Math.floor(sortedTimes.length / 2)]
        : (sortedTimes[sortedTimes.length / 2 - 1] + sortedTimes[sortedTimes.length / 2]) / 2

  return {
    sessionId: context.sessionId,
    userId: context.userId,
    userEmail: context.userEmail ?? null, // ⭐ 关键这一行
    mode: context.mode,
    subMode: context.subMode,

    startAt: context.startAt,
    endAt,
    durationMs,

    totalCount,
    correctCount,
    wrongCount,
    accuracy,

    avgAnswerTimeMs,
    medianAnswerTimeMs,

    stats: context.stats,

    timeSlot: getTimeSlot(context.startAt),
    isComplete,

    createdAt: endAt,
  }
}

/**
 * 根据时间戳计算练习时间段
 */
function getTimeSlot(timestamp: number): string {
  const hour = new Date(timestamp).getHours()

  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 23) return 'evening'
  return 'night'
}
