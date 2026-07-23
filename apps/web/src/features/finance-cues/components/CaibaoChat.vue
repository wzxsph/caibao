<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'
import type { ApprovedExperience } from '../contracts'
import { streamCaibaoChat, type CaibaoChatMessage } from '../chat-client'

const props = defineProps<{ experience: ApprovedExperience; sessionId: string }>()
const messages = ref<CaibaoChatMessage[]>([])
const inputText = ref('')
const busy = ref(false)
const error = ref('')
const messageList = ref<HTMLElement>()
let controller: AbortController | null = null

const suggestions = [
  '这段内容哪些是事实，哪些是作者观点？',
  '请用“原因—机制—结果”总结主题',
  '还缺什么条件才能支持这个结论？'
]

onBeforeUnmount(() => controller?.abort())

async function send(text = inputText.value) {
  const content = text.trim().slice(0, 300)
  if (!content || busy.value) return
  error.value = ''
  inputText.value = ''
  messages.value.push({ role: 'user', content }, { role: 'assistant', content: '' })
  const answerIndex = messages.value.length - 1
  busy.value = true
  controller = new AbortController()
  await nextTick()
  messageList.value?.scrollTo({ top: messageList.value.scrollHeight })
  try {
    await streamCaibaoChat({
      videoId: props.experience.videoId,
      contentVersion: props.experience.contentVersion,
      sessionId: props.sessionId,
      messages: messages.value.slice(0, -1),
      signal: controller.signal,
      onDelta(delta) {
        messages.value[answerIndex].content += delta
        void nextTick(() => messageList.value?.scrollTo({ top: messageList.value.scrollHeight }))
      }
    })
    if (!messages.value[answerIndex].content) {
      messages.value[answerIndex].content = '当前信息不足，请回到视频证据或换一个问题。'
    }
  } catch (cause) {
    messages.value.splice(answerIndex, 1)
    if ((cause as DOMException).name !== 'AbortError') {
      error.value = cause instanceof Error ? cause.message : '财包暂时无法回答'
    }
  } finally {
    busy.value = false
    controller = null
  }
}
</script>

<template>
  <div class="chat" data-testid="caibao-chat">
    <p class="boundary">
      财包只依据当前公开 Mock 内容回答，并区分事实、观点与信息不足；不提供投资建议。
    </p>
    <div v-if="!messages.length" class="suggestions">
      <button
        v-for="suggestion in suggestions"
        :key="suggestion"
        type="button"
        @click="send(suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>
    <div ref="messageList" class="messages" aria-live="polite">
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
        <b>{{ message.role === 'assistant' ? '财包' : '你' }}</b>
        <p>{{ message.content || '正在梳理证据…' }}</p>
      </div>
    </div>
    <p v-if="error" class="error" role="status">{{ error }}</p>
    <form @submit.prevent="send()">
      <input v-model="inputText" maxlength="300" placeholder="追问事实、机制、条件或观点…" />
      <button type="submit" :disabled="busy || !inputText.trim()">
        {{ busy ? '回答中' : '发送' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.chat {
  display: grid;
  gap: 10px;
  color: #29271f;
}
.boundary {
  margin: 0;
  padding: 9px 11px;
  color: #73644d;
  background: #f5ead0;
  border-radius: 10px;
  font-size: 11px;
  line-height: 1.5;
}
.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.suggestions button {
  min-height: 36px;
  padding: 6px 10px;
  color: #765a1b;
  background: #fff8e6;
  border: 1px solid #d9bd6f;
  border-radius: 18px;
  font-size: 11px;
}
.messages {
  display: grid;
  max-height: 210px;
  overflow: auto;
  gap: 8px;
}
.message {
  max-width: 88%;
  padding: 8px 10px;
  border-radius: 12px;
  background: #eee8dc;
}
.message.user {
  justify-self: end;
  background: #ffe690;
}
.message b {
  font-size: 10px;
}
.message p {
  margin: 3px 0 0;
  font-size: 12px;
  line-height: 1.55;
  white-space: pre-wrap;
}
.error {
  margin: 0;
  color: #a34e35;
  font-size: 11px;
}
form {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}
input {
  min-width: 0;
  min-height: 44px;
  box-sizing: border-box;
  padding: 0 12px;
  border: 1px solid #d8cdb8;
  border-radius: 12px;
}
form button {
  min-width: 68px;
  min-height: 44px;
  color: #211f18;
  background: #ffd541;
  border: 0;
  border-radius: 12px;
  font-weight: 700;
}
button {
  cursor: pointer;
}
button:disabled {
  opacity: 0.55;
}
</style>
