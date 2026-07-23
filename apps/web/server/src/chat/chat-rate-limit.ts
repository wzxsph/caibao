import { createHash } from 'node:crypto'
import type { ChatHandlerOptions, ChatQuotaResult } from './chat-handler.js'

interface RedisRestResponse {
  result?: number | string | null
  error?: string
}

export function createRedisQuotaChecker(input: {
  redisUrl: string
  redisToken: string
  perVideoLimit: number
  dailyLimit: number
  fetcher?: typeof fetch
}): ChatHandlerOptions['checkQuota'] {
  return async (identity): Promise<ChatQuotaResult> => {
    if (input.perVideoLimit <= 0 && input.dailyLimit <= 0) {
      return { allowed: true, remainingDaily: 2_147_483_647, remainingVideo: 2_147_483_647 }
    }
    if (!input.redisUrl || !input.redisToken) return { allowed: false, reason: 'quota_unavailable' }
    const day = new Date().toISOString().slice(0, 10)
    const fingerprint = createHash('sha256')
      .update(`${identity.ip}:${identity.anonymousId}`)
      .digest('hex')
      .slice(0, 32)
    const dailyKey = `caibao:chat:daily:${day}:${fingerprint}`
    const videoKey = `caibao:chat:video:${day}:${fingerprint}:${identity.videoId}`
    try {
      const response = await (input.fetcher ?? fetch)(
        `${input.redisUrl.replace(/\/$/, '')}/pipeline`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${input.redisToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([
            ['INCR', dailyKey],
            ['EXPIRE', dailyKey, 172800, 'NX'],
            ['INCR', videoKey],
            ['EXPIRE', videoKey, 172800, 'NX']
          ]),
          signal: AbortSignal.timeout(5_000)
        }
      )
      if (!response.ok) return { allowed: false, reason: 'quota_unavailable' }
      const results = (await response.json()) as RedisRestResponse[]
      const daily = Number(results[0]?.result)
      const video = Number(results[2]?.result)
      if (!Number.isFinite(daily) || !Number.isFinite(video)) {
        return { allowed: false, reason: 'quota_unavailable' }
      }
      if (input.dailyLimit > 0 && daily > input.dailyLimit) {
        return { allowed: false, reason: 'daily_limit' }
      }
      if (input.perVideoLimit > 0 && video > input.perVideoLimit) {
        return { allowed: false, reason: 'video_limit' }
      }
      return {
        allowed: true,
        remainingDaily:
          input.dailyLimit > 0 ? Math.max(0, input.dailyLimit - daily) : 2_147_483_647,
        remainingVideo:
          input.perVideoLimit > 0 ? Math.max(0, input.perVideoLimit - video) : 2_147_483_647
      }
    } catch {
      return { allowed: false, reason: 'quota_unavailable' }
    }
  }
}
