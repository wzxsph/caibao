<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  title: string
  prompt: string
  placeholder: string
  minLength: number
  maxLength: number
  example?: string
  rubrics?: { label?: string; keywords?: string[] }[]
}>()

const emit = defineEmits<{
  complete: [payload: { response: string; hitRubrics: string[] }]
  dismiss: []
}>()

const text = ref('')
const showExample = ref(false)
const submitted = ref(false)
const hitRubrics = ref<string[]>([])

const charCount = computed(() => text.value.length)
const canSubmit = computed(
  () => charCount.value >= props.minLength && charCount.value <= props.maxLength
)
const tooShort = computed(() => text.value.length > 0 && charCount.value < props.minLength)
const tooLong = computed(() => charCount.value > props.maxLength)

function evaluateRubrics(): string[] {
  if (!props.rubrics) return []
  return props.rubrics
    .filter((r) => r.keywords.some((kw) => text.value.includes(kw)))
    .map((r) => r.label)
}

function submit() {
  if (!canSubmit.value) return
  hitRubrics.value = evaluateRubrics()
  submitted.value = true
  emit('complete', { response: text.value, hitRubrics: hitRubrics.value })
}
</script>

<template>
  <div class="retell-interaction">
    <h3 class="retell-title">{{ title }}</h3>
    <p class="retell-prompt">{{ prompt }}</p>

    <div v-if="!submitted" class="retell-input-area">
      <textarea
        v-model="text"
        :placeholder="placeholder"
        :maxlength="maxLength + 10"
        rows="5"
        class="retell-textarea"
      />
      <div class="retell-meta">
        <span class="char-count" :class="{ 'char-warn': tooShort, 'char-over': tooLong }">
          {{ charCount }} / {{ minLength }}–{{ maxLength }} 字
        </span>
        <button v-if="example" class="btn-example" @click="showExample = !showExample">
          {{ showExample ? '收起示例' : '参考示例' }}
        </button>
      </div>
      <div v-if="showExample && example" class="retell-example">
        {{ example }}
      </div>
      <div class="retell-actions">
        <button class="btn-skip" @click="emit('dismiss')">先跳过</button>
        <button class="btn-submit" :disabled="!canSubmit" @click="submit">提交</button>
      </div>
    </div>

    <div v-else class="retell-submitted">
      <div class="retell-response-display">
        <p class="response-label">你的回答：</p>
        <p class="response-text">{{ text }}</p>
      </div>
      <div v-if="hitRubrics.length" class="retell-rubrics">
        <p class="rubrics-label">你提到了这些关键点：</p>
        <ul>
          <li v-for="r in hitRubrics" :key="r">{{ r }}</li>
        </ul>
      </div>
      <div v-else class="retell-no-rubrics">
        <p>你用自己的话做了复述。继续看视频，之后可以再试一次。</p>
      </div>
    </div>
  </div>
</template>
