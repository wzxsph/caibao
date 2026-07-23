<script setup lang="ts">
import type { TimelineTrigger } from '../contracts'
import RetellInteraction from './RetellInteraction.vue'

const props = defineProps<{
  trigger: TimelineTrigger
}>()

const emit = defineEmits<{
  complete: [payload: { response: string; feedback: string; kind?: string; isCorrect?: boolean; answerId?: string }]
}>()

function completeContext() {
  if (props.trigger.kind !== 'context_card') return
  emit('complete', {
    response: props.trigger.payload.keyPoint,
    feedback: props.trigger.payload.feedback,
    isCorrect: true,
    answerId: 'ack'
  })
}

function selectCondition(optionId: string) {
  if (props.trigger.kind !== 'condition_slider') return
  const option = props.trigger.payload.options.find((candidate) => candidate.id === optionId)
  if (!option) return
  emit('complete', {
    response: option.label + '：' + option.result,
    feedback: option.result,
    isCorrect: true,
    answerId: optionId
  })
}

function selectCausal(option: string) {
  if (props.trigger.kind !== 'causal_stitch') return
  const correct = option === props.trigger.payload.correctOption
  emit('complete', {
    response: (correct ? '识别正确：' : '已修正：') + props.trigger.payload.correctOption,
    feedback: props.trigger.payload.feedback,
    isCorrect: correct,
    answerId: option
  })
}

function selectJudgment(optionId: string) {
  if (props.trigger.kind !== 'quick_judgment') return
  const option = props.trigger.payload.options.find((candidate) => candidate.id === optionId)
  if (!option) return
  emit('complete', {
    response: option.label + '：' + option.result,
    feedback: props.trigger.payload.feedback,
    isCorrect: true,
    answerId: optionId
  })
}

function skipJudgment() {
  if (props.trigger.kind !== 'quick_judgment') return
  emit('complete', {
    response: '暂时不确定',
    feedback: props.trigger.payload.feedback,
    isCorrect: false,
    answerId: 'skip'
  })
}

function selectFlip(optionId: string) {
  if (props.trigger.kind !== 'counterexample_flip') return
  const option = props.trigger.payload.options.find((candidate) => candidate.id === optionId)
  if (!option) return
  emit('complete', {
    response: option.label + '：' + option.result,
    feedback: props.trigger.payload.feedback,
    isCorrect: true,
    answerId: optionId
  })
}

function completeCompare() {
  if (props.trigger.kind !== 'concept_compare') return
  emit('complete', {
    response: props.trigger.payload.left.term + ' vs ' + props.trigger.payload.right.term,
    feedback: props.trigger.payload.keyDistinction,
    isCorrect: true,
    answerId: 'compare'
  })
}

function completeRetell(payload: { response: string; hitRubrics: string[] }) {
  emit('complete', {
    kind: 'retell',
    response: payload.response,
    feedback: payload.hitRubrics.join('；')
  })
}

function dismissCue() {
  emit('complete', { kind: 'retell', response: '已跳过', feedback: '' })
}
</script>

<template>
  <div class="interaction" data-testid="finance-interaction">
    <aside
      v-if="trigger.backgroundContext"
      class="trigger-background"
      data-testid="trigger-background"
    >
      <small>背景</small>
      <b>{{ trigger.backgroundContext.setting }}</b>
      <ul v-if="trigger.backgroundContext.keyFacts && trigger.backgroundContext.keyFacts.length">
        <li v-for="fact in trigger.backgroundContext.keyFacts" :key="fact">{{ fact }}</li>
      </ul>
      <p v-if="trigger.backgroundContext.relevance">
        与本触点的关联：{{ trigger.backgroundContext.relevance }}
      </p>
    </aside>
    <template v-if="trigger.kind === 'context_card'">
      <div v-if="trigger.backgroundContext" class="context-banner">
        <span class="context-banner-label">{{ trigger.backgroundContext.setting }}</span>
      </div>
      <div class="context-body-card">
        <p class="lead">{{ trigger.payload.body }}</p>
      </div>
      <div class="key-point card-highlight">
        <small>记住这一点</small>
        <b>{{ trigger.payload.keyPoint }}</b>
      </div>
      <div v-if="trigger.payload.chapterLabel || trigger.payload.whyNow || trigger.payload.lookAhead || trigger.payload.reference" class="context-extra-grid">
        <p v-if="trigger.payload.chapterLabel" class="context-chapter">
          <small>📍 本节</small><span>{{ trigger.payload.chapterLabel }}</span>
        </p>
        <p v-if="trigger.payload.whyNow" class="context-why">
          <small>💡 为什么现在</small><span>{{ trigger.payload.whyNow }}</span>
        </p>
        <p v-if="trigger.payload.lookAhead" class="context-lookahead">
          <small>🔮 接下来</small><span>{{ trigger.payload.lookAhead }}</span>
        </p>
        <p v-if="trigger.payload.reference" class="context-reference">
          <small>📖 参考</small><span>{{ trigger.payload.reference }}</span>
        </p>
      </div>
      <p v-if="trigger.payload.feedback" class="context-feedback">{{ trigger.payload.feedback }}</p>
      <button class="primary" type="button" @click.stop="completeContext">我知道了</button>
    </template>

    <template v-else-if="trigger.kind === 'condition_slider'">
      <p class="lead">只换一个条件，看看哪条路径会变强。</p>
      <div class="variable">
        <small>变量</small>
        <b>{{ trigger.payload.variable }}</b>
      </div>
      <div class="option-grid">
        <button
          v-for="option in trigger.payload.options"
          :key="option.id"
          type="button"
          @click.stop="selectCondition(option.id)"
        >
          {{ option.label }}
        </button>
      </div>
    </template>

    <template v-else-if="trigger.kind === 'causal_stitch'">
      <div class="causal-path">
        <span>{{ trigger.payload.before }}</span>
        <i>→</i>
        <b>补上中间一步</b>
        <i>→</i>
        <span>{{ trigger.payload.after }}</span>
      </div>
      <div class="option-list">
        <button
          v-for="option in trigger.payload.options"
          :key="option"
          type="button"
          @click.stop="selectCausal(option)"
        >
          {{ option }}
        </button>
      </div>
    </template>

    <template v-else-if="trigger.kind === 'quick_judgment'">
      <p class="lead">先凭直觉判断，不确定也没关系。</p>
      <div class="key-point">
        <small>快速判断</small>
        <b>{{ trigger.payload.title }}</b>
      </div>
      <div class="option-list">
        <button
          v-for="option in trigger.payload.options"
          :key="option.id"
          type="button"
          @click.stop="selectJudgment(option.id)"
        >
          {{ option.label }}
        </button>
        <button class="soft" type="button" @click.stop="skipJudgment">不确定</button>
      </div>
    </template>

    <template v-else-if="trigger.kind === 'counterexample_flip'">
      <p class="lead">换个条件，看看主导路径会不会变。</p>
      <div class="key-point">
        <small>换个条件看看</small>
        <b>{{ trigger.payload.baseClaim }}</b>
      </div>
      <div class="option-list">
        <button
          v-for="option in trigger.payload.options"
          :key="option.id"
          type="button"
          @click.stop="selectFlip(option.id)"
        >
          {{ option.label }}
        </button>
      </div>
    </template>

    <template v-else-if="trigger.kind === 'concept_compare'">
      <div class="compare-grid">
        <div class="compare-side">
          <small>{{ trigger.payload.left.term }}</small>
          <p>{{ trigger.payload.left.description }}</p>
        </div>
        <div class="compare-side">
          <small>{{ trigger.payload.right.term }}</small>
          <p>{{ trigger.payload.right.description }}</p>
        </div>
      </div>
      <div class="key-point">
        <small>关键区别</small>
        <b>{{ trigger.payload.keyDistinction }}</b>
      </div>
      <button class="primary" type="button" @click.stop="completeCompare">我能区分了</button>
    </template>

    <div v-else-if="trigger.kind === 'retell'" class="interaction-renderer__body">
      <RetellInteraction
        :title="trigger.payload.title"
        :prompt="trigger.payload.prompt"
        :placeholder="trigger.payload.placeholder"
        :minLength="trigger.payload.minLength"
        :maxLength="trigger.payload.maxLength"
        :example="trigger.payload.example"
        :rubrics="trigger.payload.rubrics"
        @complete="completeRetell"
        @dismiss="dismissCue"
      />
    </div>
  </div>
</template>

<style scoped lang="less">
.interaction {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: #24221d;
}

.lead {
  margin: 0;
  color: #3b3932;
  font-size: 15px;
  line-height: 1.75;
}

.trigger-background {
  display: grid;
  gap: 8px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #fdf6e8, #efe9dc);
  border-left: 5px solid #b88a2b;
  border-radius: 14px;

  small {
    color: #8a681b;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  b {
    color: #2c2a25;
    font-size: 14px;
    line-height: 1.55;
  }

  ul {
    margin: 0;
    padding-left: 18px;
    color: #4e493f;
    font-size: 13px;
    line-height: 1.6;

    li { margin-bottom: 3px; }
  }

  p {
    margin: 0;
    color: #5e5749;
    font-size: 13px;
    line-height: 1.6;
  }
}

.context-banner {
  padding: 10px 14px;
  background: linear-gradient(135deg, #2a2820, #3b3630);
  border-radius: 12px;

  .context-banner-label {
    color: #ffd541;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.03em;
  }
}

.context-body-card {
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #e7dcc6;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.context-extra-grid {
  display: grid;
  gap: 6px;
}

.key-point.card-highlight,
.variable {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #fdf4d8, #f5ead0);
  border-left: 5px solid #d3a32b;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(217, 170, 44, 0.12);

  small {
    color: #8f6d1f;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  b {
    font-size: 16px;
    line-height: 1.6;
    color: #2a2820;
  }
}

.variable {
  background: linear-gradient(135deg, #e8f0f8, #dce8f4);
  border-left-color: #4a7da4;

  small { color: #4a7da4; }
}

.key-point:not(.card-highlight),
.variable:not(.card-highlight) {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  background: #f5ead0;
  border-left: 4px solid #d3a32b;
  border-radius: 12px;

  small {
    color: #8f6d1f;
    font-size: 11px;
  }

  b {
    font-size: 14px;
    line-height: 1.5;
  }
}

.context-chapter,
.context-why,
.context-lookahead,
.context-reference {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0;
  padding: 10px 12px;
  background: #f5ead0;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.55;
}
.context-why { background: #fdf4e0; }
.context-lookahead { background: linear-gradient(135deg, #fcf0d2, #f7e9c8); }
.context-reference { background: #efe9dc; font-size: 12px; color: #5e5648; }
.context-chapter small,
.context-why small,
.context-lookahead small,
.context-reference small {
  flex: 0 0 auto;
  color: #8a681b;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.04em;
}
.context-chapter span,
.context-why span,
.context-lookahead span,
.context-reference span {
  flex: 1 1 auto;
  color: #2a2820;
  font-weight: 500;
}
.context-feedback {
  margin: 8px 0;
  padding: 8px 12px;
  color: #4e493f;
  font-size: 12px;
  line-height: 1.6;
  background: #fff;
  border-left: 3px solid #d9aa2c;
  border-radius: 0 8px 8px 0;
}

.primary,
.option-grid button,
.option-list button {
  min-height: 44px;
  border-radius: 12px;
  cursor: pointer;
}

.primary {
  color: #1a1915;
  background: #ffd541;
  border: 0;
  font-size: 14px;
  font-weight: 700;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  button {
    padding: 10px;
    color: #fff;
    background: #24231f;
    border: 1px solid #35332d;
    font-size: 13px;
  }
}

.causal-path {
  display: grid;
  grid-template-columns: 1fr auto 1.15fr auto 1fr;
  gap: 6px;
  align-items: center;
  color: #3b3932;
  text-align: center;

  span,
  b {
    display: flex;
    min-height: 54px;
    padding: 8px;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    font-size: 12px;
    line-height: 1.35;
  }

  span {
    background: #efe9dc;
  }

  b {
    color: #7e5f18;
    background: #fff1b7;
    border: 1px dashed #d3a32b;
  }

  i {
    color: #aa8122;
    font-style: normal;
  }
}

.option-list {
  display: grid;
  gap: 8px;

  button {
    padding: 8px 12px;
    color: #2c2a25;
    background: #fff;
    border: 1px solid #d9cfbb;
    font-size: 13px;
    text-align: left;
  }

  button.soft {
    color: #6b6559;
    background: #f3eee2;
    border-style: dashed;
  }
}

.compare-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.compare-side {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  background: #efe9dc;
  border-radius: 12px;

  small {
    color: #7e5f18;
    font-size: 13px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #3b3932;
    font-size: 12px;
    line-height: 1.5;
  }
}
</style>
