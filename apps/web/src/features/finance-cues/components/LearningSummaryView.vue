<script setup lang="ts">
import { computed } from 'vue'
import type { ApprovedExperience, LearningSummary } from '../contracts'
import { buildReport, type ReportData } from '@/features/finance-cues/summary'

const props = defineProps<{
  experience: ApprovedExperience
  summary: LearningSummary
}>()

defineEmits<{
  revisit: [triggerId: string]
  report: []
}>()

const reportData = computed<ReportData | null>(() => {
  if (!props.experience) return null
  return buildReport(props.experience)
})
</script>

<template>
  <div class="summary-view" data-testid="finance-learning-summary">
    <p class="summary-intro">
      这里只记录你实际碰过的证据；没有点击的内容标记为“尚未观察”，不会扣分。
    </p>

    <section>
      <h3>你已经碰到</h3>
      <ul v-if="summary.observed.length">
        <li v-for="item in summary.observed" :key="item.triggerId">
          <span>✓</span>
          <b>{{ item.title }}</b>
        </li>
      </ul>
      <p v-else class="empty">还没有完成触点，可以从黄色圆点回看。</p>
    </section>

    <section>
      <h3>尚未观察</h3>
      <button
        v-for="item in summary.notObserved"
        :key="item.triggerId"
        type="button"
        @click.stop="$emit('revisit', item.triggerId)"
      >
        <span>{{ item.title }}</span>
        <em>回看</em>
      </button>
      <p v-if="!summary.notObserved.length" class="empty">本次三个关键触点都已观察。</p>
    </section>

    <button class="report-link" type="button" @click.stop="$emit('report')">
      生成完整推演报告与分享卡
    </button>

    <div v-if="reportData" class="learning-report">
      <div class="report-header">
        <p class="report-eyebrow">{{ reportData.eyebrow }}</p>
        <h3 class="report-title">{{ reportData.title }}</h3>
      </div>

      <div class="report-core-variable">
        <p class="core-label">核心变量</p>
        <p class="core-value">{{ reportData.coreVariable }}</p>
      </div>

      <div class="report-paths">
        <h4>因果路径</h4>
        <div
          v-for="path in reportData.paths"
          :key="path.icon"
          :class="['path-card', `path-${path.tone}`]"
        >
          <span class="path-icon">{{ path.icon }}</span>
          <div class="path-text">
            <p class="path-top">{{ path.top }}</p>
            <p class="path-arrow">→</p>
            <p class="path-bottom">{{ path.bottom }}</p>
          </div>
        </div>
      </div>

      <div class="report-counter">
        <h4>反向力量</h4>
        <p>{{ reportData.counterPath.join(' → ') }}</p>
      </div>

      <div class="report-skills">
        <h4>本期能力印记</h4>
        <div class="skill-stamps">
          <div
            v-for="stamp in reportData.skillStamps"
            :key="stamp.icon"
            class="skill-stamp"
          >
            <span class="stamp-icon">{{ stamp.icon }}</span>
            <span class="stamp-label">{{ stamp.label }}</span>
          </div>
        </div>
      </div>

      <div class="report-transfer">
        <h4>能力迁移</h4>
        <p>{{ reportData.transferQuestion }}</p>
      </div>

      <p class="report-disclaimer">{{ reportData.disclaimer }}</p>
    </div>

    <footer>{{ experience.notice }}</footer>
  </div>
</template>

<style scoped lang="less">
.summary-view {
  display: grid;
  gap: 12px;
  color: #2a2823;
}

.summary-intro {
  margin: 0;
  padding: 10px 12px;
  color: #665f52;
  background: #f4ead4;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1.55;
}

section {
  display: grid;
  gap: 8px;

  h3 {
    margin: 0;
    font-size: 14px;
  }

  ul {
    display: grid;
    gap: 7px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  li,
  button {
    display: flex;
    min-height: 44px;
    box-sizing: border-box;
    align-items: center;
    gap: 9px;
    padding: 9px 11px;
    color: #2e2c27;
    background: #fff;
    border: 1px solid #dfd5c1;
    border-radius: 11px;
    text-align: left;
  }

  li span {
    color: #4f9274;
    font-weight: 800;
  }

  button {
    justify-content: space-between;
    cursor: pointer;

    em {
      color: #9a7521;
      font-size: 12px;
      font-style: normal;
    }
  }
}

.empty {
  margin: 0;
  color: #888176;
  font-size: 12px;
}

.report-link {
  min-height: 44px;
  color: #201e18;
  background: #ffd541;
  border: 0;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
}

footer {
  padding-bottom: 4px;
  color: #9b7662;
  font-size: 10px;
  line-height: 1.45;
}

.learning-report {
  display: grid;
  gap: 12px;
  padding: 12px;
  background: #faf7f0;
  border: 1px solid #dfd5c1;
  border-radius: 12px;
}

.report-header {
  display: grid;
  gap: 4px;
}

.report-eyebrow {
  margin: 0;
  color: #9a7521;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.report-title {
  margin: 0;
  font-size: 16px;
  color: #201e18;
}

.report-core-variable {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #dfd5c1;
  border-radius: 11px;
}

.core-label {
  margin: 0;
  font-size: 10px;
  color: #888176;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.core-value {
  margin: 0;
  font-size: 14px;
  color: #2a2823;
  font-weight: 600;
}

.report-paths,
.report-counter,
.report-skills,
.report-transfer {
  display: grid;
  gap: 8px;

  h4 {
    margin: 0;
    font-size: 12px;
    color: #665f52;
  }
}

.path-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 11px;
  background: #fff;
  border: 1px solid #dfd5c1;

  &.path-teal {
    border-left: 3px solid #4f9274;
  }

  &.path-gold {
    border-left: 3px solid #9a7521;
  }

  &.path-blue {
    border-left: 3px solid #6579a6;
  }
}

.path-icon {
  font-size: 18px;
  flex-shrink: 0;
  width: 28px;
  text-align: center;
}

.path-text {
  display: grid;
  gap: 2px;
}

.path-top,
.path-bottom {
  margin: 0;
  font-size: 13px;
  color: #2a2823;
}

.path-arrow {
  margin: 0;
  font-size: 12px;
  color: #888176;
}

.report-counter p {
  margin: 0;
  padding: 10px 12px;
  font-size: 13px;
  color: #2a2823;
  background: #fff;
  border: 1px solid #dfd5c1;
  border-radius: 11px;
}

.skill-stamps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-stamp {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #fff;
  border: 1px solid #dfd5c1;
  border-radius: 8px;
}

.stamp-icon {
  font-size: 14px;
}

.stamp-label {
  font-size: 12px;
  color: #2a2823;
}

.report-transfer p {
  margin: 0;
  padding: 10px 12px;
  font-size: 13px;
  color: #2a2823;
  background: #fff;
  border: 1px solid #dfd5c1;
  border-radius: 11px;
  font-style: italic;
}

.report-disclaimer {
  margin: 0;
  padding-top: 4px;
  color: #9b7662;
  font-size: 10px;
  line-height: 1.45;
}
</style>
