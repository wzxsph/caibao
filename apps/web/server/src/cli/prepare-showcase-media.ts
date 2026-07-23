import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { AuthorizedMediaPreparer } from '../media/authorized-media.js'

const manifestPath = path.resolve(
  process.env.AUTHORIZED_DOUYIN_MANIFEST ??
    './media-import/authorized-douyin/download-manifest.json'
)
const preparedRoot = path.resolve(
  process.env.SHOWCASE_MEDIA_ROOT ?? './.analysis-work/showcase-media'
)
const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as { batchId?: string }
const preparedManifestPath = path.join(
  preparedRoot,
  String(manifest.batchId ?? ''),
  'prepared-manifest.json'
)

const startedAt = Date.now()
const result = await new AuthorizedMediaPreparer({
  manifestPath,
  preparedRoot,
  maxLongEdge: 640,
  videoPreset: 'veryfast',
  videoCrf: 30,
  maxVideoBitrateKbps: 550,
  audioBitrate: '48k',
  posterLongEdge: 640,
  concurrency: 2,
  reuseExisting: true,
  // The existing 2026-07-23 batch predates profile fingerprints. It is accepted
  // only after full source, derivative, poster and ffprobe verification.
  allowLegacyProfileReuse: true
}).prepare()
process.stdout.write(
  `${JSON.stringify({
    status: result.reused ? 'reused' : 'prepared',
    legacyProfile: result.legacyProfile ?? false,
    itemCount: result.itemCount,
    profileFingerprint: result.preparationProfile.fingerprint,
    stages: result.timings,
    elapsedMs: Date.now() - startedAt,
    preparedManifestPath
  })}\n`
)
