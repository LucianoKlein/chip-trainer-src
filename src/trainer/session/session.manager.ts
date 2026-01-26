import type { SessionContext } from './session.context'
import type { SessionPersister } from '../storage/persist.session'

import { shouldSplitSession } from './session.shouldSplit'
import { finalizeSession } from './session.finalize'
import { FirestoreWrongCasePersister } from '../storage/firestore.wrongCase'

interface SessionManagerOptions {
  maxDurationMs: number
  idleTimeoutMs: number
}

/**
 * SessionManager
 * 负责 Session 的切换与保存
 */
export class SessionManager {
  private context: SessionContext
  private persister: SessionPersister
  private options: SessionManagerOptions
  private lastAnswerAt: number
  private detailPersisters = [new FirestoreWrongCasePersister()]

  constructor(
    context: SessionContext,
    persister: SessionPersister,
    options: SessionManagerOptions
  ) {
    this.context = context
    this.persister = persister
    this.options = options
    this.lastAnswerAt = Date.now()
  }

  /**
   * 每次用户答完一题后调用
   */
  async afterAnswer(): Promise<boolean> {
    this.lastAnswerAt = Date.now()

    const needSplit = shouldSplitSession(this.context, {
      maxDurationMs: this.options.maxDurationMs,
      idleTimeoutMs: this.options.idleTimeoutMs,
      lastAnswerAt: this.lastAnswerAt,
    })

    if (!needSplit) return false

    await this.flush(true)
    return true
  }

  /**
   * 主动或异常触发的保存
   */
  async flush(isComplete: boolean): Promise<void> {
    const session = finalizeSession(this.context, isComplete)
    if (!session) return
    await this.persister.save(session)

    // ===== NEW：写入明细（错题等） =====
    for (const persister of this.detailPersisters) {
      await persister.save(session.sessionId, this.context.details)
    }

    this.context.details = []
  }

  /**
   * 重置 SessionContext，开始新的 Session
   */
  private resetContext() {
    this.context.sessionId = crypto.randomUUID()
    this.context.startAt = Date.now()
    this.context.totalCount = 0
    this.context.correctCount = 0
    this.context.wrongCount = 0
    this.context.answerTimes = []
    this.context.stats = []
    this.context.state = 'active'
    this.context.details = []
  }
}
