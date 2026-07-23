import { describe, expect, it, vi } from 'vitest'
import {
  DeterministicShowcaseLlmMock,
  generateShowcaseBundle,
  type ShowcaseLlmMock
} from '../src/showcase/mock-content-generator.js'
import {
  SHOWCASE_CONTENT_SEEDS,
  SHOWCASE_EXPERIENCE_BY_VIDEO_ID
} from '../src/showcase/content-seeds.js'

function manifestFixture() {
  return {
    schemaVersion: 2,
    batchId: 'showcase-test-batch',
    rights: {
      status: 'authorized',
      authorizedSubject: 'test operator',
      attestationId: 'test-attestation',
      verificationStatus: 'user_attested_not_independently_verified',
      purpose: 'test-only showcase',
      retentionUntil: '2026-08-22'
    },
    items: SHOWCASE_CONTENT_SEEDS.map((seed, index) => ({
      itemId: seed.itemId,
      sourceUrl: `https://www.douyin.com/video/${seed.itemId}`,
      author: index < 15 ? '小Lin说' : '大陆姓陆',
      title: `测试标题 ${index + 1}`,
      publishedAtObserved: '2026-07-23 00:00',
      aiGeneratedDisclosureObserved: index % 3 === 0,
      relativePath: `${seed.itemId}.mp4`,
      durationSeconds: index === 0 ? 173.71 : 240 + index,
      width: 1080,
      height: 1920,
      bytes: 1000 + index,
      sha256: (index + 1).toString(16).padStart(64, '0')
    }))
  }
}

describe('showcase LLM mock generation pipeline', () => {
  it('has one deterministic content seed and experience id for every manifest item', () => {
    expect(SHOWCASE_CONTENT_SEEDS).toHaveLength(25)
    expect(new Set(SHOWCASE_CONTENT_SEEDS.map((seed) => seed.itemId)).size).toBe(25)
    expect(Object.keys(SHOWCASE_EXPERIENCE_BY_VIDEO_ID)).toHaveLength(25)
  })

  it('calls the LLM mock for all 25 videos and emits schema-oriented internal PoC content', async () => {
    const delegate = new DeterministicShowcaseLlmMock()
    let calls = 0
    const llm: ShowcaseLlmMock = {
      async generate(input) {
        calls += 1
        return delegate.generate(input)
      }
    }

    const bundle = await generateShowcaseBundle({
      manifest: manifestFixture(),
      llm,
      generatedAt: '2026-07-23T00:00:00.000Z'
    })

    expect(calls).toBe(25)
    expect(bundle.catalog).toHaveLength(25)
    expect(bundle.experiences).toHaveLength(25)
    expect(bundle.catalog.map((item) => item.videoId)).toEqual(
      SHOWCASE_CONTENT_SEEDS.map((seed) => seed.itemId)
    )
    expect(bundle.catalog.every((item) => item.sourceUrl.includes('douyin.com/video/'))).toBe(true)
    expect(bundle.experiences.every((item) => item.publishStatus === 'internal_poc')).toBe(true)
    expect(bundle.experiences.every((item) => item.generation.mode === 'mock')).toBe(true)
    expect(
      bundle.experiences.every((item) =>
        item.triggers.every((trigger) => trigger.reviewStatus === 'mock')
      )
    ).toBe(true)
  })

  it('keeps all generated automatic cues at least 45 seconds apart and covers six UI kinds', async () => {
    const bundle = await generateShowcaseBundle({
      manifest: manifestFixture(),
      generatedAt: '2026-07-23T00:00:00.000Z'
    })
    const kinds = new Set<string>()

    for (const experience of bundle.experiences) {
      expect(experience.triggers.length).toBeGreaterThanOrEqual(3)
      expect(experience.triggers.length).toBeLessThanOrEqual(6)
      for (const trigger of experience.triggers) kinds.add(trigger.kind)
      for (let index = 1; index < experience.triggers.length; index += 1) {
        expect(
          experience.triggers[index].startMs - experience.triggers[index - 1].startMs
        ).toBeGreaterThanOrEqual(45_000)
      }
    }

    expect([...kinds].sort()).toEqual(
      [
        'causal_stitch',
        'concept_compare',
        'condition_slider',
        'context_card',
        'counterexample_flip',
        'quick_judgment'
      ].sort()
    )
    expect(bundle.experiences.some((experience) => experience.triggers.length > 4)).toBe(true)
  })

  it('authors concrete condition choices plus opening and report guidance for public videos', async () => {
    const bundle = await generateShowcaseBundle({
      manifest: manifestFixture(),
      generatedAt: '2026-07-23T00:00:00.000Z'
    })
    const publicIds = new Set([
      '7664748624454192393',
      '7660817965343870248',
      '7660177158400216347',
      '7659728419487337747',
      '7631441410851360041',
      '7638141580495614437',
      '7664831270933284217',
      '7664151518648828581',
      '7656039421858309242',
      '7664981604339829114'
    ])
    const publicExperiences = bundle.experiences.filter((item) => publicIds.has(item.videoId))
    expect(publicExperiences).toHaveLength(10)
    expect(publicExperiences.every((item) => item.openingBrief.summary.length >= 20)).toBe(true)
    expect(
      publicExperiences.every(
        (item) =>
          item.reportPerspectives.map((entry) => entry.audience).join(',') ===
          '国家与公共部门,企业,居民'
      )
    ).toBe(true)

    const conditionCues = publicExperiences.flatMap((item) =>
      item.triggers.filter((trigger) => trigger.kind === 'condition_slider')
    )
    expect(conditionCues.length).toBeGreaterThan(0)
    for (const cue of conditionCues) {
      const payload = cue.payload as { options: Array<{ label: string }> }
      expect(payload.options.map((option) => option.label).join(' ')).not.toMatch(/走弱|维持|走强/)
      expect(cue.evaluation.mode).toBe('exploratory')
    }
  })

  it('fails closed when the manifest and curated seed inventory diverge', async () => {
    const manifest = manifestFixture()
    manifest.items = manifest.items.slice(0, 24)
    await expect(generateShowcaseBundle({ manifest })).rejects.toThrow(
      'Every manifest item must have exactly one showcase content seed'
    )
  })

  it('reuses fingerprint-and-version matched experiences without calling the generator again', async () => {
    const manifest = manifestFixture()
    const first = await generateShowcaseBundle({
      manifest,
      generatedAt: '2026-07-23T00:00:00.000Z'
    })
    const llm: ShowcaseLlmMock = { generate: vi.fn() }
    const statuses: string[] = []
    const second = await generateShowcaseBundle({
      manifest,
      existingBundle: first,
      llm,
      generatedAt: '2026-07-23T00:00:00.000Z',
      onItem: (status) => statuses.push(status)
    })
    expect(llm.generate).not.toHaveBeenCalled()
    expect(statuses).toEqual(Array(25).fill('reused'))
    expect(second.experiences).toEqual(first.experiences)
  })
})
