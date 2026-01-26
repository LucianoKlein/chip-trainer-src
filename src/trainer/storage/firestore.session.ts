import { doc, setDoc } from 'firebase/firestore'
import type { Session } from '../session/session.types'
import type { SessionPersister } from './persist.session'
import { db } from '@/firebase' // 确保这里是你项目里已有的 firebase 实例

/**
 * Firestore 版 Session 存储实现
 */
export class FirestoreSessionPersister implements SessionPersister {
  async save(session: Session): Promise<void> {
    const ref = doc(db, 'training_stats', session.sessionId)

    await setDoc(ref, session)
  }
}
