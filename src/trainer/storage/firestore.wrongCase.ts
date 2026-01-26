import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import type { DetailPersister } from './persist.detail'

export interface WrongCaseDetail {
  category: string
  key: string
  payload: unknown
  createdAt: number
  mode: string
  subMode: string
}

export class FirestoreWrongCasePersister implements DetailPersister {
  async save(sessionId: string, details: unknown[]): Promise<void> {
    const wrongCases = details as WrongCaseDetail[]

    if (!wrongCases || wrongCases.length === 0) return

    const colRef = collection(db, 'training_stats', sessionId, 'wrong_cases')

    for (const wrongCase of wrongCases) {
      await addDoc(colRef, wrongCase)
    }

    // ⭐️ 关键：防止重复 flush 时再次写入
    wrongCases.length = 0
  }
}
