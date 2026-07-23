/**
 * Slimmed-down runtime config for the extracted pipeline.
 *
 * Only the variables that drive `parse → ASR → text-gen` are kept. Anything
 * caibao-server-only (chat rate limits, GitHub Pages Vercel function plumbing,
 * douyin public-profile scraping) is omitted on purpose — this skill is meant
 * to be repackaged without dragging the entire app along.
 */
import path from 'node:path'
import { z } from 'zod'

const rawSchema = z.object({
  PIPELINE_WORK_ROOT: z.string().default('./.pipeline-work'),
  FFMPEG_PATH: z.string().default('ffmpeg'),
  FFPROBE_PATH: z.string().default('ffprobe'),

  LLM_PROVIDER: z.enum(['openai', 'mock']).default('mock'),

  TRANSCRIPT_OVERRIDE: z.string().default(''),
  OCR_OVERRIDE: z.string().default(''),

  OPENAI_API_KEY: z.string().default(''),
  OPENAI_BASE_URL: z.string().url().default('https://api.minimaxi.com/v1'),
  OPENAI_MODEL: z.string().default('MiniMax-M2.7'),
  OPENAI_MULTIMODAL_MODEL: z.string().default(''),
  OPENAI_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  OPENAI_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(2),

  VOLC_ASR_ENABLED: z.string().default('true'),
  VOLC_ASR_ENDPOINT: z
    .string()
    .url()
    .default('https://openspeech.bytedance.com/api/v3/auc/bigmodel/recognize/flash'),
  VOLC_ASR_RESOURCE_ID: z.string().default('volc.bigasr.auc_turbo'),
  VOLC_ASR_API_KEY: z.string().default(''),
  VOLC_ASR_APP_ID: z.string().default(''),
  VOLC_ASR_ACCESS_TOKEN: z.string().default(''),
  VOLC_ASR_TIMEOUT_MS: z.coerce.number().int().positive().default(120_000),
  VOLC_ASR_MAX_AUDIO_MB: z.coerce.number().positive().default(100),
  VOLC_ASR_MAX_BASE64_AUDIO_MB: z.coerce.number().positive().default(20),

  VOLC_OCR_ENABLED: z.string().default('false'),
  VOLC_OCR_ENDPOINT: z.string().url().default('https://visual.volcengineapi.com'),
  VOLC_ACCESS_KEY_ID: z.string().default(''),
  VOLC_SECRET_ACCESS_KEY: z.string().default(''),
  VOLC_OCR_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000)
})

function envBoolean(value: string): boolean {
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
}

export interface RuntimeConfig {
  pipelineWorkRoot: string
  ffmpegPath: string
  ffprobePath: string
  llmProvider: 'openai' | 'mock'
  transcriptOverride: string
  ocrOverride: string
  openai: {
    apiKey: string
    baseUrl: string
    model: string
    multimodalModel: string
    timeoutMs: number
    maxRetries: number
  }
  asr: {
    enabled: boolean
    endpoint: string
    resourceId: string
    apiKey: string
    appId: string
    accessToken: string
    timeoutMs: number
    maxAudioMb: number
    maxBase64AudioMb: number
  }
  ocr: {
    enabled: boolean
    endpoint: string
    accessKeyId: string
    secretAccessKey: string
    timeoutMs: number
  }
}

export function loadRuntimeConfig(
  source: Record<string, string | undefined> = process.env
): RuntimeConfig {
  const raw = rawSchema.parse(source)
  return {
    pipelineWorkRoot: path.resolve(raw.PIPELINE_WORK_ROOT),
    ffmpegPath: raw.FFMPEG_PATH,
    ffprobePath: raw.FFPROBE_PATH,
    llmProvider: raw.LLM_PROVIDER,
    transcriptOverride: raw.TRANSCRIPT_OVERRIDE,
    ocrOverride: raw.OCR_OVERRIDE,
    openai: {
      apiKey: raw.OPENAI_API_KEY,
      baseUrl: raw.OPENAI_BASE_URL,
      model: raw.OPENAI_MODEL,
      multimodalModel: raw.OPENAI_MULTIMODAL_MODEL,
      timeoutMs: raw.OPENAI_TIMEOUT_MS,
      maxRetries: raw.OPENAI_MAX_RETRIES
    },
    asr: {
      enabled: envBoolean(raw.VOLC_ASR_ENABLED),
      endpoint: raw.VOLC_ASR_ENDPOINT,
      resourceId: raw.VOLC_ASR_RESOURCE_ID,
      apiKey: raw.VOLC_ASR_API_KEY,
      appId: raw.VOLC_ASR_APP_ID,
      accessToken: raw.VOLC_ASR_ACCESS_TOKEN,
      timeoutMs: raw.VOLC_ASR_TIMEOUT_MS,
      maxAudioMb: raw.VOLC_ASR_MAX_AUDIO_MB,
      maxBase64AudioMb: raw.VOLC_ASR_MAX_BASE64_AUDIO_MB
    },
    ocr: {
      enabled: envBoolean(raw.VOLC_OCR_ENABLED),
      endpoint: raw.VOLC_OCR_ENDPOINT,
      accessKeyId: raw.VOLC_ACCESS_KEY_ID,
      secretAccessKey: raw.VOLC_SECRET_ACCESS_KEY,
      timeoutMs: raw.VOLC_OCR_TIMEOUT_MS
    }
  }
}

export interface ProviderReadiness {
  llm: { provider: RuntimeConfig['llmProvider']; ready: boolean; missing: string[] }
  asr: { enabled: boolean; ready: boolean; missing: string[]; overridden: boolean }
  ocr: { enabled: boolean; ready: boolean; missing: string[]; overridden: boolean }
}

/**
 * Decide which optional providers the pipeline can reach. Used to print a
 * clear startup banner and to decide which fallbacks to wire in automatically.
 */
export function providerReadiness(config: RuntimeConfig): ProviderReadiness {
  const llmMissing: string[] = []
  if (config.llmProvider === 'openai') {
    if (!config.openai.apiKey) llmMissing.push('OPENAI_API_KEY')
  }

  const asrMissing: string[] = []
  if (config.asr.enabled) {
    if (!config.transcriptOverride) {
      const hasNewCred = Boolean(config.asr.apiKey)
      const hasLegacyCred = Boolean(config.asr.appId && config.asr.accessToken)
      if (!hasNewCred && !hasLegacyCred) {
        asrMissing.push('VOLC_ASR_API_KEY or VOLC_ASR_APP_ID+VOLC_ASR_ACCESS_TOKEN')
      }
    }
  }

  const ocrMissing: string[] = []
  if (config.ocr.enabled) {
    if (!config.ocr.accessKeyId) ocrMissing.push('VOLC_ACCESS_KEY_ID')
    if (!config.ocr.secretAccessKey) ocrMissing.push('VOLC_SECRET_ACCESS_KEY')
  }

  return {
    llm: { provider: config.llmProvider, ready: llmMissing.length === 0, missing: llmMissing },
    asr: {
      enabled: config.asr.enabled,
      ready: asrMissing.length === 0,
      missing: asrMissing,
      overridden: Boolean(config.transcriptOverride)
    },
    ocr: {
      enabled: config.ocr.enabled,
      ready: ocrMissing.length === 0,
      missing: ocrMissing,
      overridden: Boolean(config.ocrOverride)
    }
  }
}