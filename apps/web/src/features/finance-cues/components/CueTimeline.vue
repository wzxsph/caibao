<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TimelineTrigger, TraceAction } from '../contracts'

const props = defineProps<{
  triggers: TimelineTrigger[]
  statuses: Record<string, TraceAction | undefined>
  durationMs: number
  currentTimeMs?: number
}>()

const emit = defineEmits<{
  revisit: [triggerId: string]
  'request-seek': [positionMs: number]
}>()

const trackRef = ref<HTMLElement | null>(null)
const dragging = ref(false)

const effectiveDuration = computed(() => {
  if (props.durationMs > 0) return props.durationMs
  const fallback = props.triggers.reduce((max, item) => Math.max(max, item.endMs), 0)
  return Math.max(fallback, 1)
})

const progressPercent = computed(() => {
  const safeCurrent = Math.max(0, props.currentTimeMs ?? 0)
  return Math.min(100, Math.max(0, (safeCurrent / effectiveDuration.value) * 100))
})

function position(trigger: TimelineTrigger): string {
  return Math.min(98, Math.max(2, (trigger.startMs / effectiveDuration.value) * 100)) + '%'
}

function statusClass(triggerId: string): string {
  const status = props.statuses[triggerId]
  if (status === 'completed') return 'completed'
  if (status === 'dismissed' || status === 'missed') return 'pending'
  if (status) return 'seen'
  return 'scheduled'
}

function positionFromEvent(event: PointerEvent): number {
  const track = trackRef.value
  if (!track) return 0
  const rect = track.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / Math.max(rect.width, 1)))
  return Math.round(ratio * effectiveDuration.value)
}

function startDrag(event: PointerEvent) {
  if (!trackRef.value) return
  dragging.value = true
  trackRef.value.setPointerCapture?.(event.pointerId)
  emit('request-seek', positionFromEvent(event))
}

function moveDrag(event: PointerEvent) {
  if (!dragging.value) return
  emit('request-seek', positionFromEvent(event))
}

function endDrag(event: PointerEvent) {
  if (!dragging.value) return
  dragging.value = false
  trackRef.value?.releasePointerCapture?.(event.pointerId)
  emit('request-seek', positionFromEvent(event))
}
</script>

<template>
  <div
    class="cue-timeline"
    data-testid="finance-cue-timeline"
    @pointerdown.stop
    @pointermove.stop
    @pointerup.stop
    @pointercancel.stop
    @click.stop
  >
    <i
      ref="trackRef"
      class="track"
      data-testid="finance-cue-timeline-track"
      @pointerdown="startDrag"
      @pointermove="moveDrag"
      @pointerup="endDrag"
      @pointercancel="endDrag"
    >
      <i class="fill" :style="{ width: progressPercent + '%' }"></i>
      <i
        class="handle"
        :style="{ left: progressPercent + '%' }"
        aria-label="拖动进度"
        role="slider"
        :aria-valuenow="progressPercent"
      ></i>
    </i>
    <button
      v-for="trigger in triggers"
      :key="trigger.triggerId"
      type="button"
      :class="statusClass(trigger.triggerId)"
      :style="{ left: position(trigger) }"
      :aria-label="'回看：' + trigger.prompt"
      @click.stop="$emit('revisit', trigger.triggerId)"
    >
      <span></span>
    </button>
  </div>
</template>

<style scoped lang="less">
.cue-timeline {
  position: absolute;
  right: 7%;
  bottom: 12px;
  left: 7%;
  z-index: 16;
  height: 44px;
  pointer-events: auto;

  .track {
    position: absolute;
    top: 21px;
    right: 0;
    left: 0;
    display: block;
    height: 6px;
    background: rgba(255, 255, 255, 0.28);
    border-radius: 3px;
    touch-action: none;

    .fill {
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      height: 100%;
      background: #ffd541;
      border-radius: 3px;
      pointer-events: none;
    }

    .handle {
      position: absolute;
      top: 50%;
      width: 14px;
      height: 14px;
      background: #fff;
      border: 2px solid #ffd541;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
  }

  button {
    position: absolute;
    top: 0;
    width: 44px;
    height: 44px;
    padding: 0;
    transform: translateX(-50%);
    background: transparent;
    border: 0;
    cursor: pointer;

    span {
      display: block;
      width: 9px;
      height: 9px;
      margin: auto;
      background: #8e8b84;
      border: 2px solid rgba(0, 0, 0, 0.48);
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
    }

    &.completed span {
      background: #64b88d;
    }

    &.pending span {
      background: #ffd541;
    }

    &.seen span {
      background: #fff1b7;
    }
  }
}
</style>