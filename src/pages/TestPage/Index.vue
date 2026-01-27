<script setup lang="ts">
  import { ref } from 'vue'

  import { createSessionContext } from '@/trainer/session/session.create'
  import { updateSessionContext } from '@/trainer/session/session.update'
  import { SessionManager } from '@/trainer/session/session.manager'
  import { FirestoreSessionPersister } from '@/trainer/storage/firestore.session'

  const manager = ref<SessionManager | null>(null)
  const context = ref<any>(null)

  function start() {
    context.value = createSessionContext(
      'test-user-id', // 先写死
      'chip',
      'cash'
    )

    const persister = new FirestoreSessionPersister()

    manager.value = new SessionManager(context.value, persister, {
      maxDurationMs: 10 * 60 * 1000, // 10 分钟
      idleTimeoutMs: 3 * 60 * 1000, // 3 分钟
    })

    console.log('Session started', context.value.sessionId)
  }

  function answerCorrect() {
    if (!context.value || !manager.value) return

    updateSessionContext(context.value, {
      isCorrect: true,
      answerTimeMs: 1200,
    })

    manager.value.afterAnswer()
    console.log('Answer correct')
  }

  function answerWrong() {
    if (!context.value || !manager.value) return

    updateSessionContext(context.value, {
      isCorrect: false,
      answerTimeMs: 1800,
    })

    manager.value.afterAnswer()
    console.log('Answer wrong')
  }

  async function finish() {
    if (!manager.value) return

    await manager.value.flush(true)
    console.log('Session saved')
  }
</script>

<template>
  <div style="padding: 24px">
    <h2>Trainer Test Page</h2>

    <button @click="start">开始训练</button>
    <button @click="answerCorrect">答对一题</button>
    <button @click="answerWrong">答错一题</button>
    <button @click="finish">结束并保存</button>
  </div>
</template>
