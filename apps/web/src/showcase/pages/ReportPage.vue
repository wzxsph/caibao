<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import caibaoImage from '@/features/finance-cues/assets/caibao.png'
import CaibaoChat from '@/features/finance-cues/components/CaibaoChat.vue'
import { buildEvidenceReport, reportShareText } from '@/features/finance-cues/report'
import type { ReportPerspective } from '@/features/finance-cues/contracts'
import { renderReportShareCard } from '@/features/finance-cues/share-card'
import { useFinanceCueStore } from '@/features/finance-cues/session-store'
import { DEMO_FINANCE_LEVEL, loadDemoWallet } from '@/features/finance-cues/wallet'
import { showcaseBundle, showcaseExperiences } from '@/showcase/catalog'

const route = useRoute()
const store = useFinanceCueStore()
const actionStatus = ref('')
const item = computed(() =>
  showcaseBundle.catalog.find((candidate) => candidate.videoId === String(route.params.videoId))
)
const experience = computed(() =>
  item.value ? showcaseExperiences[item.value.financeExperienceId] : undefined
)
const reportSession = computed(() =>
  experience.value ? store.hydrate(experience.value) : undefined
)
const report = computed(() => {
  if (!experience.value || !reportSession.value) return undefined
  return buildEvidenceReport(experience.value, reportSession.value, loadDemoWallet().coins)
})

async function createFile() {
  if (!report.value) throw new Error('Report is unavailable')
  const blob = await renderReportShareCard(report.value)
  return new File([blob], `caibao-${report.value.videoId}.png`, { type: 'image/png' })
}

async function shareReport() {
  if (!report.value) return
  try {
    const file = await createFile()
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      await navigator.share({
        title: report.value.title,
        text: reportShareText(report.value),
        files: [file]
      })
      actionStatus.value = '已打开系统分享'
      return
    }
    await saveReport()
  } catch (error) {
    if ((error as DOMException).name !== 'AbortError')
      actionStatus.value = '分享未完成，可保存图片或复制摘要'
  }
}

async function saveReport() {
  try {
    const file = await createFile()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(file)
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(link.href), 0)
    actionStatus.value = '总结卡片已生成'
  } catch {
    actionStatus.value = '图片生成失败，请复制文字摘要'
  }
}

async function copyReport() {
  if (!report.value) return
  try {
    await navigator.clipboard.writeText(reportShareText(report.value))
    actionStatus.value = '文字摘要已复制'
  } catch {
    actionStatus.value = '复制失败，请使用系统分享或保存长图'
  }
}

function formatTimestamp(ms: number): string {
  const safe = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const expandedPerspective = ref<ReportPerspective | null>(null)
function openPerspective(entry: ReportPerspective) {
  expandedPerspective.value = expandedPerspective.value === entry ? null : entry
}
</script>

<template>
  <main class="report-page">
    <RouterLink class="back" to="/home">← 返回推荐</RouterLink>
    <section v-if="report && item" class="report-card" data-testid="evidence-report">
      <header>
        <img :src="caibaoImage" alt="财包" />
        <div>
          <small>本期推演复盘 · Mock</small>
          <h1>{{ report.title }}</h1>
          <p>财经等级 {{ DEMO_FINANCE_LEVEL }} 级 · 社交标识 Demo</p>
        </div>
      </header>

      <div class="metrics" aria-label="本次学习记录">
        <span
          >完成关键点 <b>{{ report.completedNodes }}</b></span
        >
        <span
          >正确答题 <b>{{ report.correctAnswers }}</b></span
        >
        <span
          >主动跳过 <b>{{ report.skippedNodes }}</b></span
        >
        <span
          >金币 <b>🪙 {{ report.coinsCollected }}</b></span
        >
      </div>

      <section class="opening">
        <small>{{ report.openingBrief.contentType }}</small>
        <h2>主题与事实/观点提醒</h2>
        <p>{{ report.openingBrief.summary }}</p>
        <strong>{{ report.openingBrief.viewpointNotice }}</strong>
        <footer>{{ report.openingBrief.verificationBoundary }}</footer>
      </section>

      <section>
        <h2>掌握情况</h2>
        <div class="mastery-grid">
          <article v-for="entry in report.observed" :key="entry.triggerId">
            <b>✓ 已观察</b><span>{{ entry.title }}</span>
          </article>
          <article v-for="entry in report.notObserved" :key="entry.triggerId" class="pending">
            <b>待加强</b><span>{{ entry.title }}</span>
          </article>
        </div>
      </section>

      <section v-if="report.reasoning" class="reasoning">
        <h2>推演思路</h2>
        <p class="hand-written-note">{{ report.reasoning.handWrittenNote }}</p>
        <small>核心变量：{{ report.reasoning.coreVariable }}</small>
        <div class="reasoning-paths">
          <article
            v-for="(path, index) in report.reasoning.paths"
            :key="index"
            :class="['reasoning-path', 'tone-' + path.tone]"
          >
            <header>
              <span class="icon">{{ path.icon }}</span>
              <b>路径 {{ index + 1 }}</b>
            </header>
            <p class="top">{{ path.top }}</p>
            <p class="bottom">{{ path.bottom }}</p>
          </article>
        </div>
        <div v-if="report.reasoning.counterPath.length" class="counter-path">
          <small>反例路径</small>
          <ol>
            <li v-for="(step, index) in report.reasoning.counterPath" :key="index">{{ step }}</li>
          </ol>
        </div>
      </section>

      <section>
        <h2>财经事件影响到谁</h2>
        <ol class="poi-perspectives" data-testid="perspective-pois">
          <li v-for="entry in report.perspectives" :key="entry.audience" class="poi-perspective">
            <button
              type="button"
              class="poi-pill"
              :aria-label="`展开 ${entry.audience} 影响细节`"
              @click.stop="openPerspective(entry)"
            >
              <span class="poi-icon">🔗</span>
              <span class="poi-text">{{ entry.audience }}</span>
              <small class="poi-impact">{{ entry.impact.slice(0, 24) }}{{ entry.impact.length > 24 ? '…' : '' }}</small>
            </button>
          </li>
        </ol>
        <aside v-if="expandedPerspective" class="poi-detail">
          <h4>{{ expandedPerspective.audience }}的影响</h4>
          <p><b>影响：</b>{{ expandedPerspective.impact }}</p>
          <p><b>原因：</b>{{ expandedPerspective.reason }}</p>
          <p><b>观察与应对：</b>{{ expandedPerspective.response }}</p>
        </aside>
      </section>

      <section class="suggestions">
        <h2>建议补充</h2>
        <p v-if="report.notObserved.length">回到时间轴补看尚未观察的关键点，再检查条件与反例。</p>
        <p v-else>关键点均已观察，可以尝试用三句话复述“原因—机制—结果”。</p>
      </section>

      <section v-if="report.suggestedWatch" class="suggested-watch">
        <h2>推荐进一步拓展观看</h2>
        <div class="suggested-watch-card">
          <div>
            <b>{{ report.suggestedWatch.label }}</b>
            <p v-if="report.suggestedWatch.note">{{ report.suggestedWatch.note }}</p>
          </div>
          <span class="timestamp">{{ formatTimestamp(report.suggestedWatch.startMs) }}</span>
        </div>
      </section>

      <section v-if="experience && reportSession" class="report-chat">
        <h2>继续问财包</h2>
        <CaibaoChat :experience="experience" :session-id="reportSession.sessionId" />
      </section>

      <div class="actions">
        <button type="button" @click="shareReport">系统分享</button>
        <button type="button" @click="saveReport">保存长图</button>
        <button type="button" @click="copyReport">复制摘要</button>
      </div>
      <p v-if="actionStatus" class="status" role="status">{{ actionStatus }}</p>
      <footer class="notice">
        {{ report.notice }}
        <a :href="item.sourceUrl" target="_blank" rel="noopener noreferrer">查看抖音原作品 ↗</a>
      </footer>
    </section>
    <section v-else class="missing">
      <h1>这份报告不可用</h1>
      <p>仅公开清单内的视频可以生成本地学习报告。</p>
    </section>
  </main>
</template>

<style scoped>
.report-page {
  min-height: 100vh;
  padding: 20px;
  color: #28261f;
  background: #eee8dc;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}
.back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  color: #5e543e;
  text-decoration: none;
  font-size: 18px;
}
.report-card {
  max-width: 980px;
  margin: 0 auto;
  padding: 24px;
  background: #fffaf0;
  border-radius: 28px;
  box-shadow: 0 18px 60px rgba(66, 50, 20, 0.14);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}
header {
  display: flex;
  gap: 18px;
  align-items: center;
}
header img {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fff0b2;
}
header h1 {
  margin: 5px 0;
  font-size: clamp(18px, 2.6vw, 24px);
  line-height: 1.3;
}
header p,
header small {
  margin: 0;
  color: #9a7521;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 20px 0;
}
.metrics span,
.mastery-grid article {
  padding: 12px;
  background: #fff;
  border: 1px solid #e7dcc6;
  border-radius: 14px;
}
.opening,
.suggestions {
  padding: 18px;
  background: #f8efd9;
  border-left: 4px solid #d9aa2c;
  border-radius: 16px;
}
.opening h2,
section h2 {
  margin: 4px 0 12px;
}
.opening p,
.opening footer {
  line-height: 1.65;
}
.opening strong {
  display: block;
  color: #8b5d21;
}
.opening footer,
.notice {
  margin-top: 10px;
  color: #8c7963;
  font-size: 12px;
}
.mastery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.mastery-grid article {
  display: grid;
  gap: 6px;
}
.mastery-grid article b {
  color: #338768;
}
.mastery-grid article.pending b {
  color: #c2772b;
}
.poi-perspectives {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  list-style: none;
}
.poi-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 6px 12px;
  background: #f5ead0;
  border: 1px solid rgba(217, 170, 44, 0.3);
  border-radius: 22px;
  font-size: 13px;
  color: #2a2820;
  cursor: pointer;
}
.poi-pill .poi-icon { color: #8a681b; }
.poi-pill .poi-impact { color: #8a681b; font-size: 11px; }
.poi-detail {
  margin-top: 14px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #e7dcc6;
  border-radius: 14px;
}
.poi-detail h4 { margin: 0 0 8px; color: #8a681b; }
.poi-detail p { margin: 4px 0; line-height: 1.55; }
.reasoning {
  padding: 18px;
  background: #fff;
  border: 1px solid #e7dcc6;
  border-radius: 16px;
}
.reasoning .hand-written-note {
  padding: 12px 14px;
  color: #2a2820;
  background: repeating-linear-gradient(
    to bottom,
    #fffbe6,
    #fffbe6 22px,
    rgba(217, 170, 44, 0.18) 22px,
    rgba(217, 170, 44, 0.18) 23px
  );
  border-left: 3px solid #d9aa2c;
  border-radius: 12px;
  font-size: 14px;
  font-style: italic;
  line-height: 1.7;
}
.reasoning small {
  display: block;
  margin-top: 8px;
  color: #8a681b;
  font-size: 12px;
}
.reasoning-paths {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}
.reasoning-path {
  display: grid;
  gap: 6px;
  padding: 12px;
  background: #f8efd9;
  border-radius: 14px;
}
.reasoning-path header {
  display: flex;
  gap: 6px;
  align-items: center;
}
.reasoning-path .icon {
  font-size: 16px;
}
.reasoning-path b {
  color: #5b3f12;
  font-size: 12px;
}
.reasoning-path .top {
  margin: 0;
  color: #8a681b;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
}
.reasoning-path .bottom {
  margin: 0;
  color: #2c2a25;
  font-size: 12px;
  line-height: 1.55;
}
.reasoning-path.tone-teal {
  background: #e1efe8;
}
.reasoning-path.tone-gold {
  background: #fff5d4;
}
.reasoning-path.tone-blue {
  background: #e3ecf7;
}
.counter-path {
  margin-top: 12px;
  padding: 12px 14px;
  background: #fff;
  border: 1px dashed #d9aa2c;
  border-radius: 12px;
}
.counter-path small {
  display: block;
  margin-bottom: 6px;
  color: #8a681b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.counter-path ol {
  margin: 0;
  padding-left: 18px;
  color: #4e493f;
  font-size: 12px;
  line-height: 1.55;
}
.suggested-watch {
  padding: 18px;
  background: #f8efd9;
  border-radius: 16px;
}
.suggested-watch-card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  background: #fff;
  border-radius: 12px;
}
.suggested-watch-card b {
  display: block;
  color: #2a2820;
  font-size: 13px;
}
.suggested-watch-card p {
  margin: 4px 0 0;
  color: #6b6559;
  font-size: 12px;
}
.suggested-watch-card .timestamp {
  padding: 4px 10px;
  color: #8a681b;
  background: #fff1b7;
  border-radius: 999px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
}
.report-chat {
  margin-top: 18px;
  padding: 16px;
  background: #fff;
  border: 1px solid #e7dcc6;
  border-radius: 16px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}
.actions button {
  min-height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: 12px;
  background: #ffd541;
  color: #29261e;
  font-weight: 700;
}
.status {
  color: #6d604d;
}
.notice {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.notice a {
  color: #8a681b;
}
.missing {
  max-width: 560px;
  margin: 20vh auto;
  text-align: center;
}
@media (max-width: 720px) {
  .report-page {
    padding: 10px;
  }
  .report-card {
    padding: 16px;
    border-radius: 20px;
  }
  header img {
    width: 56px;
    height: 56px;
  }
  .metrics {
    grid-template-columns: repeat(2, 1fr);
  }
  .mastery-grid,
  .reasoning-paths {
    grid-template-columns: 1fr;
  }
  .notice {
    display: grid;
  }
}
</style>
