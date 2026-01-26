import type { SessionContext } from './session.context'

export function createSessionContext(
  user: { uid: string; email?: string | null },
  mode: string,
  subMode: string
): SessionContext {
  return {
    sessionId: crypto.randomUUID(),

    // 👇 用户信息
    userId: user.uid,
    userEmail: user.email ?? null,

    mode,
    subMode,

    startAt: Date.now(),

    totalCount: 0,
    correctCount: 0,
    wrongCount: 0,

    answerTimes: [],
    stats: [],
    details: [],
    state: 'active',
  }
}
