import { updateSessionContext } from './session/session.update'
import type { SessionContext } from './session/session.context'
import { SessionManager } from './session/session.manager'
import { FirestoreSessionPersister } from './storage/firestore.session'
import { finalizeSession } from './session/session.finalize'

// ===== 全局单例（MVP 阶段刻意这样做） =====
let currentSession: SessionContext | null = null
let sessionManager: SessionManager | null = null

/**
 * 初始化一个新的 Session
 * 在页面进入 / Trainer 启动时调用一次
 */
export function initSession(context: SessionContext) {
  currentSession = context

  sessionManager = new SessionManager(context, new FirestoreSessionPersister(), {
    // 当前阶段：只靠题数 split
    maxDurationMs: Infinity,
    idleTimeoutMs: Infinity,
  })
}

/**
 * 每答完一题调用
 */
export async function update(payload: Parameters<typeof updateSessionContext>[1]) {
  if (!currentSession || !sessionManager) return

  updateSessionContext(currentSession, payload)

  const didSplit = await sessionManager.afterAnswer()

  if (didSplit) {
    initSession(currentSession) // ✅ 新 SessionManager，新 persister
  }
}

export function addDetail(detail: unknown) {
  if (!currentSession) return
  currentSession.details.push(detail)
}

export async function flush(isComplete: boolean) {
  if (!sessionManager) return
  await sessionManager.flush(isComplete)
}

export function flushWithBeacon() {
  if (!currentSession || !sessionManager) return

  // ⚠️ finalize，但不改内存状态
  const session = finalizeSession(currentSession, true)
  if (!session) return

  const payload = JSON.stringify(session)

  // 🔥 关键：Beacon
  navigator.sendBeacon(
    '/api/training/session', // 你后端接收 beacon 的接口
    payload
  )
}
