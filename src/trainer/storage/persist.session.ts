import type { Session } from '../session/session.types'

/**
 * Session 持久化接口
 * 用来约束“Session 怎么被存”
 */
export interface SessionPersister {
  /**
   * 正常保存 Session
   * 用于自动切 Session、正常流程
   */
  save(session: Session): Promise<void>

  /**
   * 兜底保存 Session
   * 用于页面关闭、异常情况（可选实现）
   */
  saveByBeacon?(session: Session): void
}
