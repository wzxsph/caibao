import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import type { ChatExperience } from './chat-handler.js'

// Schema for the trigger shape we need (subset of the full timelineTriggerSchema).
const triggerShapeSchema = z.object({
  triggerId: z.string().min(1),
  learningObjective: z.string().min(1),
  evidenceIds: z.array(z.string().min(1)).min(1),
  payload: z.unknown()
})

const experienceShapeSchema = z.object({
  experienceId: z.string().min(1),
  videoId: z.string().min(1),
  contentVersion: z.string().min(1),
  title: z.string().min(1),
  notice: z.string().min(1),
  openingBrief: z
    .object({
      contentType: z.string().min(1),
      summary: z.string().min(1),
      viewpointNotice: z.string().min(1),
      verificationBoundary: z.string().min(1)
    })
    .optional(),
  triggers: z.array(triggerShapeSchema).min(1)
})

const bundleSchema = z.object({
  experiences: z.array(experienceShapeSchema).min(1)
})

let cachedExperiences: Map<string, ChatExperience> | null = null

function loadBundlePath(): string {
  const here = dirname(fileURLToPath(import.meta.url))
  // server-side file: apps/web/server/src/chat/showcase-experiences.ts
  // target JSON: apps/web/src/showcase/generated/showcase-bundle.json
  return resolve(here, '..', '..', '..', 'src', 'showcase', 'generated', 'showcase-bundle.json')
}

function loadExperiences(): Map<string, ChatExperience> {
  if (cachedExperiences) return cachedExperiences
  const raw = JSON.parse(readFileSync(loadBundlePath(), 'utf8')) as unknown
  const bundle = bundleSchema.parse(raw)
  const byVideoId = new Map<string, ChatExperience>()
  for (const exp of bundle.experiences) {
    byVideoId.set(exp.videoId, {
      videoId: exp.videoId,
      contentVersion: exp.contentVersion,
      title: exp.title,
      notice: exp.notice,
      openingBrief: exp.openingBrief,
      triggers: exp.triggers.map((t) => ({
        triggerId: t.triggerId,
        learningObjective: t.learningObjective,
        evidenceIds: t.evidenceIds,
        payload: t.payload
      }))
    })
  }
  cachedExperiences = byVideoId
  return byVideoId
}

export async function loadShowcaseExperience(videoId: string): Promise<ChatExperience | null> {
  const experiences = loadExperiences()
  return experiences.get(videoId) ?? null
}