export interface CaibaoChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const ANONYMOUS_ID_KEY = 'caibao-chat-anonymous-id:v1'

function createId(prefix: string) {
  const suffix = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
  return `${prefix}-${suffix}`
}

export function anonymousChatId(): string {
  const existing = localStorage.getItem(ANONYMOUS_ID_KEY)
  if (existing) return existing
  const created = createId('anon')
  localStorage.setItem(ANONYMOUS_ID_KEY, created)
  return created
}

export function financeChatUrl(): string {
  const base = import.meta.env.VITE_FINANCE_API_BASE_URL?.trim()
  const path = '/api/finance/v1/chat/stream'
  return base ? new URL(path, base.replace(/\/?$/, '/')).href : path
}

export async function streamCaibaoChat(input: {
  videoId: string
  contentVersion: string
  sessionId: string
  messages: CaibaoChatMessage[]
  signal: AbortSignal
  onDelta(delta: string): void
}): Promise<void> {
  const response = await fetch(financeChatUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      videoId: input.videoId,
      contentVersion: input.contentVersion,
      sessionId: input.sessionId,
      anonymousId: anonymousChatId(),
      messages: input.messages.slice(-8)
    }),
    signal: input.signal
  })
  if (!response.ok || !response.body) {
    const payload = await response.json().catch(() => null)
    const code = payload?.error?.code
    if (code === 'CHAT_QUOTA_EXCEEDED') throw new Error('今天的财包追问次数已用完')
    if (code === 'CHAT_NOT_CONFIGURED' || code === 'CHAT_QUOTA_UNAVAILABLE') {
      throw new Error('实时财包暂未开放，可先使用下方预设问题')
    }
    throw new Error('财包暂时没有连上，请稍后再试')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })
    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''
    for (const event of events) {
      for (const line of event.split('\n')) {
        if (!line.startsWith('data:')) continue
        const data = line.slice(5).trim()
        if (!data || data === '[DONE]') continue
        try {
          const chunk = JSON.parse(data)
          const delta = chunk.choices?.[0]?.delta?.content
          if (typeof delta === 'string') input.onDelta(delta)
        } catch {
          // Ignore malformed provider chunks; a later valid chunk may still complete the answer.
        }
      }
    }
    if (done) break
  }
}
