import rawBundle from '../../../../src/showcase/generated/showcase-bundle.json'
import rawPublicCatalog from '../../../../src/showcase/public-video-ids.json'
import {
  handleChatStreamRequest,
  type ChatExperience
} from '../../../../server/src/chat/chat-handler.js'
import { createRedisQuotaChecker } from '../../../../server/src/chat/chat-rate-limit.js'

const bundle = rawBundle as {
  catalog: Array<{ videoId: string; financeExperienceId: string }>
  experiences: ChatExperience[]
}
const publicConfig = rawPublicCatalog as { videoIds: string[] }
const publicIds = new Set(publicConfig.videoIds)
const experienceByVideoId = new Map(
  bundle.experiences
    .filter((experience) => publicIds.has(experience.videoId))
    .map((experience) => [experience.videoId, experience])
)

const numberFromEnv = (name: string, fallback: number) => {
  const value = Number(process.env[name] ?? fallback)
  return Number.isInteger(value) && value >= 0 ? value : fallback
}

export const maxDuration = 60

export default {
  async fetch(request: Request): Promise<Response> {
    return handleChatStreamRequest(request, {
      apiKey: process.env.MINIMAX_API_KEY ?? '',
      baseUrl: process.env.MINIMAX_BASE_URL ?? 'https://api.minimaxi.com/v1',
      model: process.env.MINIMAX_TEXT_MODEL ?? 'MiniMax-M2.7',
      allowedOrigin: process.env.CHAT_ALLOWED_ORIGIN ?? 'https://wzxsph.github.io',
      loadExperience: async (videoId) => experienceByVideoId.get(videoId) ?? null,
      checkQuota: createRedisQuotaChecker({
        redisUrl: process.env.UPSTASH_REDIS_REST_URL ?? '',
        redisToken: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
        perVideoLimit: numberFromEnv('CHAT_PER_VIDEO_LIMIT', 5),
        dailyLimit: numberFromEnv('CHAT_DAILY_LIMIT', 20)
      })
    })
  }
}
