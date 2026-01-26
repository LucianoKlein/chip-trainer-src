/**
 * DetailPersister
 * 用于持久化 session 相关的明细数据（错题、回放等）
 * 可扩展，不影响 Session 核心流程
 */
export interface DetailPersister {
  /**
   * 将一组明细写入到某个 session 下
   */
  save(sessionId: string, details: unknown[]): Promise<void>
}
