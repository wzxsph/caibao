/**
 * Loop harness: run the pipeline over a directory of input JSON files and
 * collect the outputs.
 *
 * This is the "agent/loop" half of the skill — an opinionated batch driver
 * that pairs with `run-pipeline.ts` (single-job "agent"). Use it when you
 * want to sweep a folder of transcripts:
 *
 *   tsx src/agent/loop.ts \
 *     --inputs-dir examples \
 *     --outputs-dir .pipeline-work/out
 */
import { config as loadDotEnv } from 'dotenv'
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { runPipelineJob } from './run-pipeline.js'
import { AppError } from '../domain/errors.js'

interface LoopArgs {
  inputsDir: string
  outputsDir: string
  provider: 'openai' | 'mock'
  pattern: RegExp
  continueOnError: boolean
}

function parseLoopArgs(argv: string[]): LoopArgs {
  const args: LoopArgs = {
    inputsDir: './examples',
    outputsDir: './.pipeline-work/out',
    provider: 'mock',
    pattern: /\.json$/,
    continueOnError: true
  }
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i]
    const value = argv[i + 1]
    switch (flag) {
      case '--inputs-dir':
        args.inputsDir = value
        i += 1
        break
      case '--outputs-dir':
        args.outputsDir = value
        i += 1
        break
      case '--provider':
        if (value !== 'openai' && value !== 'mock') {
          throw new AppError('CLI_PROVIDER_INVALID', `unknown provider "${value}"`)
        }
        args.provider = value
        i += 1
        break
      case '--pattern':
        args.pattern = new RegExp(value)
        i += 1
        break
      case '--strict':
        args.continueOnError = false
        break
      case '--help':
      case '-h':
        console.log(`caibao-pipeline-skill — loop driver

Usage:
  tsx src/agent/loop.ts [options]

Options:
      --inputs-dir <dir>     Directory of input JSON files (default: ./examples)
      --outputs-dir <dir>    Where to write per-file outputs (default: ./.pipeline-work/out)
      --provider <name>      openai | mock (default: mock)
      --pattern <regex>      Override the file pattern (default: /\\.json$/)
      --strict               Fail the whole loop on the first error
  -h, --help                Show this help`)
        process.exit(0)
    }
  }
  return args
}

export interface LoopResult {
  total: number
  succeeded: number
  failed: number
  perFile: Array<{ file: string; status: 'ok' | 'error'; error?: string }>
}

export async function runLoop(args: LoopArgs): Promise<LoopResult> {
  loadDotEnv({ path: process.env.CAIBAO_ENV_FILE || '.env', quiet: true })
  await mkdir(args.outputsDir, { recursive: true })
  const files = (await readdir(args.inputsDir)).filter((name) => args.pattern.test(name))
  const result: LoopResult = {
    total: files.length,
    succeeded: 0,
    failed: 0,
    perFile: []
  }
  for (const file of files) {
    const inputPath = path.resolve(args.inputsDir, file)
    const outputPath = path.resolve(args.outputsDir, file.replace(/\.json$/, '.out.json'))
    try {
      const payload = JSON.parse(await readFile(inputPath, 'utf8')) as { title?: string }
      await runPipelineJob({
        title: payload.title ?? file,
        inputJsonPath: inputPath,
        outPath: outputPath,
        provider: args.provider,
        printStages: false
      })
      result.succeeded += 1
      result.perFile.push({ file, status: 'ok' })
    } catch (error) {
      const app = error instanceof AppError ? error : new AppError('INTERNAL_ERROR', String(error))
      result.failed += 1
      result.perFile.push({ file, status: 'error', error: `${app.code}: ${app.message}` })
      if (!args.continueOnError) throw error
    }
  }
  return result
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  const args = parseLoopArgs(process.argv.slice(2))
  const summary = await runLoop(args)
  await mkdir(args.outputsDir, { recursive: true })
  await writeFile(
    path.join(args.outputsDir, '_summary.json'),
    JSON.stringify(summary, null, 2)
  )
  console.log(`loop done: ${summary.succeeded}/${summary.total} succeeded, ${summary.failed} failed`)
}