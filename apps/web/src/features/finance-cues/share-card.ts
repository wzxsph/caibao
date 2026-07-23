import type { EvidenceReport } from './contracts'

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const character of text) {
    const candidate = line + character
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line)
      line = character
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawWrapped(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 5
): number {
  const lines = wrapText(context, text, maxWidth).slice(0, maxLines)
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight))
  return y + lines.length * lineHeight
}

export async function renderReportShareCard(report: EvidenceReport): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1680
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is unavailable')

  context.fillStyle = '#fffaf0'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#ffd541'
  context.fillRect(0, 0, canvas.width, 26)
  context.fillStyle = '#2b2923'
  context.font = '700 32px system-ui, sans-serif'
  context.fillText('财包 · 本期推演复盘', 72, 92)
  context.font = '800 54px system-ui, sans-serif'
  let y = drawWrapped(context, report.title, 72, 180, 936, 70, 3) + 30

  context.fillStyle = '#8a681b'
  context.font = '700 27px system-ui, sans-serif'
  context.fillText(`财经等级 28 级 · 🪙 ${report.coinsCollected}`, 72, y)
  y += 62
  context.fillStyle = '#4f4a40'
  context.font = '28px system-ui, sans-serif'
  y = drawWrapped(context, report.openingBrief.summary, 72, y, 936, 44, 4) + 40

  for (const item of report.perspectives) {
    context.fillStyle = '#f5ead0'
    context.fillRect(58, y - 38, 964, 250)
    context.fillStyle = '#8a681b'
    context.font = '700 30px system-ui, sans-serif'
    context.fillText(item.audience, 86, y + 8)
    context.fillStyle = '#302e29'
    context.font = '25px system-ui, sans-serif'
    const next = drawWrapped(context, item.impact, 86, y + 58, 900, 38, 3)
    context.fillStyle = '#6a6255'
    context.font = '23px system-ui, sans-serif'
    drawWrapped(context, `原因：${item.reason}`, 86, next + 16, 900, 34, 3)
    y += 286
  }

  context.fillStyle = '#746b5c'
  context.font = '23px system-ui, sans-serif'
  drawWrapped(context, report.openingBrief.viewpointNotice, 72, y, 936, 36, 3)
  context.fillStyle = '#9b7662'
  context.font = '20px system-ui, sans-serif'
  drawWrapped(
    context,
    '等级为社交标识 Demo；内容未经最终财经审核，不构成投资建议。',
    72,
    1590,
    936,
    30,
    2
  )

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Unable to render share card'))),
      'image/png',
      0.92
    )
  })
}
