import { describe, expect, it, vi } from 'vitest'
import {
  buildGroundedSystemPrompt,
  handleChatStreamRequest,
  type ChatExperience
} from '../src/chat/chat-handler.js'

const experience: ChatExperience = {
  videoId: 'video-public',
  contentVersion: 'content-v1',
  title: '利率如何传导',
  notice: 'Mock，未经财经审核。',
  openingBrief: {
    contentType: '财经知识科普',
    summary: '解释政策利率如何通过融资成本和预期传导到企业与居民。',
    viewpointNotice: '方向判断属于作者观点，需要结合证据。',
    verificationBoundary: '未完成最终事实核验。'
  },
  triggers: [
    {
      triggerId: 'cue-1',
      learningObjective: '理解融资成本传导',
      evidenceIds: ['mock-title-video-public'],
      payload: { title: '融资成本', feedback: '利率并不直接等于资产结果。' }
    }
  ]
}

describe('public grounded chat handler', () => {
  it('builds a prompt that separates facts, viewpoints and unsafe trading requests', () => {
    const prompt = buildGroundedSystemPrompt(experience)
    expect(prompt).toContain('事实')
    expect(prompt).toContain('作者观点')
    expect(prompt).toContain('信息不足')
    expect(prompt).toContain('买卖')
    expect(prompt).toContain('mock-title-video-public')
  })

  it('streams only after server-side public-content and quota checks', async () => {
    const checkQuota = vi.fn(async () => ({
      allowed: true as const,
      remainingDaily: 19,
      remainingVideo: 4
    }))
    const providerFetch = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body))
      expect(body.stream).toBe(true)
      expect(body.reasoning_split).toBe(true)
      expect(body.max_completion_tokens).toBe(800)
      expect(body).not.toHaveProperty('max_tokens')
      expect(body.messages[0].content).toContain('未经财经审核')
      return new Response('data: {"choices":[{"delta":{"content":"你好"}}]}\n\n', {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' }
      })
    })
    const request = new Request('https://api.example/api/finance/v1/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://wzxsph.github.io' },
      body: JSON.stringify({
        videoId: 'video-public',
        contentVersion: 'content-v1',
        sessionId: 'session-12345678',
        anonymousId: 'anon-12345678',
        messages: [{ role: 'user', content: '这段话是事实还是观点？' }]
      })
    })

    const response = await handleChatStreamRequest(request, {
      apiKey: 'server-secret',
      baseUrl: 'https://api.minimaxi.com/v1',
      model: 'MiniMax-M2.7',
      allowedOrigin: 'https://wzxsph.github.io',
      loadExperience: async (videoId) => (videoId === experience.videoId ? experience : null),
      checkQuota,
      providerFetch
    })
    expect(response.status).toBe(200)
    expect(response.headers.get('X-Chat-Remaining-Video')).toBe('4')
    expect(await response.text()).toContain('你好')
    expect(checkQuota).toHaveBeenCalledOnce()
  })

  it('fails closed for non-public content or unavailable quota storage', async () => {
    const base = {
      apiKey: 'server-secret',
      baseUrl: 'https://api.minimaxi.com/v1',
      model: 'MiniMax-M2.7',
      allowedOrigin: 'https://wzxsph.github.io',
      loadExperience: async () => null,
      checkQuota: async () => ({
        allowed: false as const,
        reason: 'quota_unavailable' as const
      }),
      providerFetch: vi.fn()
    }
    const request = new Request('https://api.example/api/finance/v1/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://wzxsph.github.io' },
      body: JSON.stringify({
        videoId: 'private-video',
        contentVersion: 'v1',
        sessionId: 'session-12345678',
        anonymousId: 'anon-12345678',
        messages: [{ role: 'user', content: '你好' }]
      })
    })
    const response = await handleChatStreamRequest(request, base)
    expect(response.status).toBe(404)
    expect(base.providerFetch).not.toHaveBeenCalled()
  })
})
