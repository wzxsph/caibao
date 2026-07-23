<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type {
  InteractionExitReason,
  MediaClockState,
  PauseForInteractionRequest,
  ReleaseInteractionRequest,
  VideoContext
} from '@/features/video-extensions/contracts'
import type { ApprovedExperience, TimelineTrigger, TraceAction } from '../contracts'
import { advanceCueOrchestrator } from '../orchestrator'
import { experienceRepository } from '../repository'
import { useFinanceCueStore } from '../session-store'
import { buildLearningSummary, latestActions } from '../summary'
import { awardDemoCoins } from '../wallet'
import CaibaoHalfSheet from './CaibaoHalfSheet.vue'
import CaibaoChat from './CaibaoChat.vue'
import CuePill from './CuePill.vue'
import CueTimeline from './CueTimeline.vue'
import InteractionRenderer from './InteractionRenderer.vue'
import LearningSummaryView from './LearningSummaryView.vue'
import caibaoImage from '../assets/caibao.png'

const props = defineProps<{
  context: VideoContext
  clock: MediaClockState
}>()

const emit = defineEmits<{
  'sheet-open-change': [open: boolean]
  'pause-for-interaction': [request: PauseForInteractionRequest]
  'release-interaction': [request: ReleaseInteractionRequest]
  'request-seek': [positionMs: number]
}>()

const store = useFinanceCueStore()
const experience = ref<ApprovedExperience | null>(null)
const activeCue = ref<TimelineTrigger | null>(null)
const expandedCue = ref<TimelineTrigger | null>(null)
const feedback = ref('')
const feedbackAllowsRetry = ref(false)
const summaryOpen = ref(false)
const chatOpen = ref(false)
const briefVisible = ref(false)
const previousTimeMs = ref(0)
let cueTimer: ReturnType<typeof setTimeout> | null = null
let briefTimer: ReturnType<typeof setTimeout> | null = null
let interactionSequence = 0
let playbackInteractionId: string | null = null

const session = computed(() => {
  if (!experience.value) return null
  return store.hydrate(experience.value)
})

const statuses = computed<Record<string, TraceAction | undefined>>(() => {
  return session.value ? latestActions(session.value) : {}
})

const summary = computed(() => {
  if (!experience.value || !session.value) return null
  return buildLearningSummary(experience.value, session.value)
})

const sheetOpen = computed(() => Boolean(expandedCue.value || summaryOpen.value || chatOpen.value))
const hasTrace = computed(() =>
  Boolean(
    experience.value &&
      session.value?.events.some((event) =>
        experience.value?.triggers.some((trigger) => trigger.triggerId === event.triggerId)
      )
  )
)

watch(
  () => [props.context.videoId, props.context.financeExperienceId] as const,
  async ([videoId, experienceId]) => {
    releasePlaybackInteraction('context-change', false)
    clearCueTimer()
    clearBriefTimer()
    activeCue.value = null
    expandedCue.value = null
    summaryOpen.value = false
    chatOpen.value = false
    briefVisible.value = false
    experience.value = null
    previousTimeMs.value = props.clock.currentTimeMs
    if (!experienceId) return
    const loadedExperience = await experienceRepository.getExperience(experienceId)
    if (props.context.videoId !== videoId || props.context.financeExperienceId !== experienceId) {
      return
    }
    if (
      !loadedExperience ||
      loadedExperience.videoId !== videoId ||
      loadedExperience.mediaFingerprint !== props.context.item?.mediaFingerprint
    ) {
      return
    }
    experience.value = loadedExperience
    if (experience.value) {
      const hydrated = store.hydrate(experience.value)
      const alreadyShown = hydrated.events.some(
        (event) => event.triggerId === 'opening-brief' && event.action === 'surfaced'
      )
      if (!alreadyShown && experience.value.openingBrief) {
        briefVisible.value = true
        store.record(experience.value, {
          triggerId: 'opening-brief',
          action: 'surfaced',
          playbackPositionMs: props.clock.currentTimeMs,
          evidenceIds: []
        })
        briefTimer = setTimeout(() => {
          briefVisible.value = false
          briefTimer = null
        }, 8_000)
      }
    }
  },
  { immediate: true }
)

watch(
  () => props.clock.currentTimeMs,
  (currentTimeMs) => {
    const currentExperience = experience.value
    if (!currentExperience) {
      previousTimeMs.value = currentTimeMs
      return
    }

    const decision = advanceCueOrchestrator({
      triggers: currentExperience.triggers.filter((trigger) => trigger.delivery === 'automatic'),
      statuses: statuses.value,
      previousTimeMs: previousTimeMs.value,
      currentTimeMs,
      panelOpen: sheetOpen.value || Boolean(activeCue.value)
    })

    decision.missed.forEach((trigger) => {
      record(trigger, 'missed')
    })
    if (decision.surface) surface(decision.surface)
    previousTimeMs.value = currentTimeMs
  }
)

watch(
  () => props.clock.ended,
  (ended) => {
    if (ended && experience.value) {
      closeCue(false)
      expandedCue.value = null
      summaryOpen.value = true
      ensurePlaybackPaused('summary')
    }
  }
)

watch(sheetOpen, (open) => emit('sheet-open-change', open), { immediate: true })

onBeforeUnmount(() => {
  clearCueTimer()
  clearBriefTimer()
  releasePlaybackInteraction('unmounted', false)
  emit('sheet-open-change', false)
})

function clearCueTimer() {
  if (cueTimer) clearTimeout(cueTimer)
  cueTimer = null
}

function clearBriefTimer() {
  if (briefTimer) clearTimeout(briefTimer)
  briefTimer = null
}

function dismissBrief() {
  clearBriefTimer()
  briefVisible.value = false
}

function record(
  trigger: TimelineTrigger,
  action: TraceAction,
  response?: string,
  evidenceIds: string[] = []
) {
  if (!experience.value) return
  store.record(experience.value, {
    triggerId: trigger.triggerId,
    action,
    playbackPositionMs: props.clock.currentTimeMs,
    response,
    evidenceIds
  })
}

function surface(trigger: TimelineTrigger) {
  if (activeCue.value || sheetOpen.value) {
    record(trigger, 'missed')
    return
  }
  activeCue.value = trigger
  record(trigger, 'surfaced')
  clearCueTimer()
  cueTimer = setTimeout(() => closeCue(true), trigger.cueDurationMs)
}

function openCue(trigger: TimelineTrigger) {
  clearCueTimer()
  activeCue.value = null
  feedback.value = ''
  feedbackAllowsRetry.value = false
  ensurePlaybackPaused(trigger.triggerId)
  expandedCue.value = trigger
  summaryOpen.value = false
  chatOpen.value = false
  record(trigger, 'expanded')
}

function closeCue(recordDismissal = true) {
  const trigger = activeCue.value
  clearCueTimer()
  activeCue.value = null
  if (trigger && recordDismissal) record(trigger, 'dismissed')
}

function closeSheet(reason: InteractionExitReason = feedback.value ? 'completed' : 'closed') {
  expandedCue.value = null
  summaryOpen.value = false
  chatOpen.value = false
  feedback.value = ''
  feedbackAllowsRetry.value = false
  releasePlaybackInteraction(reason, true)
}

function complete(payload: {
  response: string
  feedback: string
  answerId?: string
  isCorrect?: boolean
}) {
  const trigger = expandedCue.value
  const currentExperience = experience.value
  if (!trigger || !currentExperience) return
  const evaluation = trigger.evaluation
  const isWrong = payload.isCorrect === false

  if (isWrong) {
    store.record(currentExperience, {
      triggerId: trigger.triggerId,
      action: 'attempted',
      playbackPositionMs: props.clock.currentTimeMs,
      response: payload.response,
      answerId: payload.answerId,
      isCorrect: false,
      coinsAwarded: 0,
      evidenceIds: trigger.evidenceIds
    })
    feedback.value = payload.feedback
    feedbackAllowsRetry.value = true
    return
  }

  const rewardCoins = evaluation?.rewardCoins ?? 1
  const reward = awardDemoCoins(
    `${currentExperience.videoId}:${currentExperience.contentVersion}:${trigger.triggerId}`,
    rewardCoins
  )
  store.record(currentExperience, {
    triggerId: trigger.triggerId,
    action: 'completed',
    playbackPositionMs: props.clock.currentTimeMs,
    response: payload.response,
    answerId: payload.answerId,
    isCorrect: payload.isCorrect ?? (evaluation?.mode === 'objective' ? true : undefined),
    coinsAwarded: reward.awarded ? rewardCoins : 0,
    evidenceIds: trigger.evidenceIds
  })
  feedback.value = evaluation?.explanation ?? payload.feedback
  feedbackAllowsRetry.value = false
}

function retryInteraction() {
  feedback.value = ''
  feedbackAllowsRetry.value = false
}

function skipInteraction() {
  const trigger = expandedCue.value
  if (trigger) record(trigger, 'dismissed')
  closeSheet('skipped')
}

function revisit(triggerId: string) {
  const trigger = experience.value?.triggers.find((candidate) => candidate.triggerId === triggerId)
  if (!trigger) return
  closeCue(false)
  record(trigger, 'revisited')
  openCue(trigger)
}

function openSummary() {
  closeCue(false)
  ensurePlaybackPaused('summary')
  expandedCue.value = null
  chatOpen.value = false
  summaryOpen.value = true
}

function openChat() {
  if (!experience.value) return
  dismissBrief()
  closeCue(false)
  ensurePlaybackPaused('chat')
  expandedCue.value = null
  summaryOpen.value = false
  chatOpen.value = true
}

function openReport() {
  if (!experience.value) return
  closeSheet('completed')
  window.location.hash = `/report/${experience.value.videoId}`
}

function ensurePlaybackPaused(sourceId: string) {
  if (playbackInteractionId) return
  playbackInteractionId = `${props.context.videoId}:${sourceId}:${++interactionSequence}`
  emit('pause-for-interaction', {
    type: 'pause-for-interaction',
    interactionId: playbackInteractionId
  })
}

function releasePlaybackInteraction(reason: InteractionExitReason, allowResume: boolean) {
  if (!playbackInteractionId) return
  const interactionId = playbackInteractionId
  playbackInteractionId = null
  emit('release-interaction', {
    type: 'release-interaction',
    interactionId,
    reason,
    allowResume
  })
}
</script>

<template>
  <div v-if="experience" class="finance-extension" data-testid="finance-cue-extension">
    <button
      type="button"
      class="caibao-fab"
      data-testid="caibao-fab"
      aria-label="打开财包对话"
      @click.stop="openChat"
      @pointerdown.stop
      @pointerup.stop
    >
      <img :src="caibaoImage" alt="财包" />
    </button>
    <aside v-if="briefVisible && experience.openingBrief" class="opening-brief" role="status">
      <button type="button" aria-label="关闭财包导读" @click.stop="dismissBrief">×</button>
      <small>{{ experience.openingBrief.contentType }}</small>
      <b>{{ experience.openingBrief.summary }}</b>
      <p>{{ experience.openingBrief.viewpointNotice }}</p>
      <footer>{{ experience.openingBrief.verificationBoundary }}</footer>
    </aside>
    <CuePill
      v-if="activeCue"
      :trigger="activeCue"
      @open="openCue(activeCue)"
      @dismiss="closeCue(true)"
    />

    <button
      v-if="hasTrace && !sheetOpen"
      type="button"
      class="trace-shortcut"
      data-testid="finance-trace-shortcut"
      @click.stop="openSummary"
      @pointerdown.stop
      @pointerup.stop
    >
      <img :src="caibaoImage" alt="" />
      <span>学习足迹</span>
    </button>

    <CueTimeline
      :triggers="experience.triggers"
      :statuses="statuses"
      :duration-ms="clock.durationMs"
      :current-time-ms="clock.currentTimeMs"
      @revisit="revisit"
      @request-seek="(positionMs) => emit('request-seek', positionMs)"
    />

    <CaibaoHalfSheet
      v-if="expandedCue"
      :title="expandedCue.payload.title"
      :eyebrow="expandedCue.cueLabel"
      @close="closeSheet"
    >
      <div v-if="feedback" class="feedback" data-testid="finance-feedback">
        <b>财包的反馈</b>
        <p>{{ feedback }}</p>
        <button v-if="feedbackAllowsRetry" type="button" @click.stop="retryInteraction">
          再想一次
        </button>
        <button v-else type="button" @click.stop="closeSheet()">收好，继续看</button>
      </div>
      <div v-else class="interaction-task">
        <InteractionRenderer :trigger="expandedCue" @complete="complete" />
        <button
          type="button"
          class="skip-interaction"
          data-testid="finance-skip-interaction"
          @click.stop="skipInteraction"
        >
          跳过，继续看
        </button>
      </div>
    </CaibaoHalfSheet>

    <CaibaoHalfSheet
      v-else-if="chatOpen && session"
      title="向财包追问"
      eyebrow="实时问答 · MiniMax"
      @close="closeSheet"
    >
      <CaibaoChat :experience="experience" :session-id="session.sessionId" />
    </CaibaoHalfSheet>

    <CaibaoHalfSheet
      v-else-if="summaryOpen && summary"
      title="这段视频，你实际看懂了什么"
      eyebrow="过程式学习总结"
      @close="closeSheet"
    >
      <LearningSummaryView
        :experience="experience"
        :summary="summary"
        @revisit="revisit"
        @report="openReport"
      />
    </CaibaoHalfSheet>
  </div>
</template>

<style scoped lang="less">
.finance-extension {
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: none;
}

.caibao-fab {
  position: absolute;
  top: calc(16px + env(safe-area-inset-top));
  left: 16px;
  z-index: 30;
  width: 48px;
  height: 48px;
  padding: 0;
  background: rgba(255, 213, 65, 0.96);
  border: 0;
  border-radius: 50%;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.32);
  cursor: pointer;
  pointer-events: auto;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
}

.opening-brief {
  position: absolute;
  top: calc(116px + env(safe-area-inset-top));
  left: 14px;
  right: 14px;
  z-index: 16;
  display: grid;
  gap: 5px;
  box-sizing: border-box;
  padding: 12px 38px 12px 14px;
  color: #29271f;
  background: rgba(255, 249, 231, 0.97);
  border-left: 4px solid #ffd541;
  border-radius: 14px;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.3);
  pointer-events: auto;

  button {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 44px;
    height: 44px;
    color: #6b6559;
    background: transparent;
    border: 0;
    font-size: 24px;
  }

  small,
  footer {
    color: #8a681b;
    font-size: 10px;
  }

  b {
    font-size: 13px;
    line-height: 1.45;
  }

  p,
  footer {
    margin: 0;
    line-height: 1.45;
  }

  p {
    font-size: 11px;
  }
}

@keyframes coin-pulse {
  50% {
    transform: scale(1.035);
    box-shadow: 0 0 0 4px rgba(255, 213, 65, 0.25);
  }
}

.trace-shortcut {
  position: absolute;
  z-index: 17;
  right: 14px;
  bottom: 56px;
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 7px;
  padding: 5px 10px 5px 6px;
  color: #29271f;
  background: rgba(255, 213, 65, 0.96);
  border: 0;
  border-radius: 22px;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.28);
  pointer-events: auto;
  cursor: pointer;

  img {
    width: 34px;
    height: 34px;
    object-fit: cover;
    border-radius: 50%;
    background: #fff4c2;
  }

  span {
    font-size: 12px;
    font-weight: 700;
  }
}

.feedback {
  display: grid;
  gap: 10px;

  b {
    color: #8a681b;
    font-size: 13px;
  }

  p {
    margin: 0;
    color: #4e493f;
    font-size: 14px;
    line-height: 1.65;
  }

  button {
    min-height: 44px;
    color: #1b1a16;
    background: #ffd541;
    border: 0;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
  }
}

.interaction-task {
  display: grid;
  gap: 10px;
}

.skip-interaction {
  min-width: 44px;
  min-height: 44px;
  color: #6d6558;
  background: transparent;
  border: 1px solid #d7cebd;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}
</style>
