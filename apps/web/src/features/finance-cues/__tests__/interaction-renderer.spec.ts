import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import InteractionRenderer from '../components/InteractionRenderer.vue'
import { financeFed6KindsExperience } from '../fixtures/finance-fed-6kinds'
import type { TimelineTrigger, TriggerKind } from '../contracts'

function triggerFor(kind: TriggerKind): TimelineTrigger {
  const trigger = financeFed6KindsExperience.triggers.find((candidate) => candidate.kind === kind)
  if (!trigger) throw new Error(`fixture missing trigger for kind ${kind}`)
  return trigger
}

function mountFor(kind: TriggerKind) {
  return mount(InteractionRenderer, {
    props: { trigger: triggerFor(kind) },
    attachTo: document.body
  })
}

function expectSingleComplete(wrapper: ReturnType<typeof mountFor>) {
  const events = wrapper.emitted('complete')
  expect(events).toHaveLength(1)
  const [payload] = events![0] as [{ response: string; feedback: string }]
  expect(typeof payload.response).toBe('string')
  expect(payload.response.length).toBeGreaterThan(0)
  expect(typeof payload.feedback).toBe('string')
  expect(payload.feedback.length).toBeGreaterThan(0)
  return payload
}

describe('InteractionRenderer', () => {
  it('renders context_card and emits complete on acknowledge', async () => {
    const wrapper = mountFor('context_card')
    expect(wrapper.find('[data-testid="finance-interaction"]').exists()).toBe(true)
    await wrapper.get('button.primary').trigger('click')
    expectSingleComplete(wrapper)
    wrapper.unmount()
  })

  it('renders condition_slider and emits complete on option select', async () => {
    const wrapper = mountFor('condition_slider')
    expect(wrapper.find('[data-testid="finance-interaction"]').exists()).toBe(true)
    await wrapper.get('.option-grid button').trigger('click')
    expectSingleComplete(wrapper)
    wrapper.unmount()
  })

  it('renders causal_stitch and emits complete on option select', async () => {
    const wrapper = mountFor('causal_stitch')
    expect(wrapper.find('[data-testid="finance-interaction"]').exists()).toBe(true)
    await wrapper.get('.option-list button').trigger('click')
    expectSingleComplete(wrapper)
    wrapper.unmount()
  })

  it('renders quick_judgment and emits complete on option select', async () => {
    const wrapper = mountFor('quick_judgment')
    expect(wrapper.find('[data-testid="finance-interaction"]').exists()).toBe(true)
    await wrapper.get('.option-list button').trigger('click')
    expectSingleComplete(wrapper)
    wrapper.unmount()
  })

  it('offers a 不确定 button on quick_judgment with no wrong wording', async () => {
    const wrapper = mountFor('quick_judgment')
    const skip = wrapper.get('button.soft')
    expect(skip.text()).toBe('不确定')
    await skip.trigger('click')
    const payload = expectSingleComplete(wrapper)
    expect(payload.response).not.toMatch(/错|误|失败|错误/)
    wrapper.unmount()
  })

  it('renders counterexample_flip and emits complete on option select', async () => {
    const wrapper = mountFor('counterexample_flip')
    expect(wrapper.find('[data-testid="finance-interaction"]').exists()).toBe(true)
    await wrapper.get('.option-list button').trigger('click')
    expectSingleComplete(wrapper)
    wrapper.unmount()
  })

  it('renders concept_compare with both sides and emits complete on completion', async () => {
    const wrapper = mountFor('concept_compare')
    expect(wrapper.find('[data-testid="finance-interaction"]').exists()).toBe(true)
    expect(wrapper.findAll('.compare-side')).toHaveLength(2)
    await wrapper.get('button.primary').trigger('click')
    expectSingleComplete(wrapper)
    wrapper.unmount()
  })

  it('renders retell interaction and emits complete with rubric results', async () => {
    const { default: RetellInteraction } = await import(
      '@/features/finance-cues/components/RetellInteraction.vue'
    )
    const wrapper = mount(RetellInteraction, {
      props: {
        title: 'Test Retell',
        prompt: 'Explain capital flow',
        placeholder: 'I would explain...',
        minLength: 24,
        maxLength: 220,
        example: 'Sample explanation text',
        rubrics: [
          { label: '美元外溢', keywords: ['美元', '美联储'] },
          { label: '本国条件', keywords: ['通胀', '增长'] }
        ]
      }
    })

    const textarea = wrapper.find('textarea')
    await textarea.setValue('美联储降息导致美元外溢，各国通胀和增长不同，这是全球经济的重要现象')
    await wrapper.find('.btn-submit').trigger('click')

    expect(wrapper.emitted('complete')).toBeTruthy()
    expect(wrapper.emitted('complete')![0][0].response).toContain('美联储')
    expect(wrapper.emitted('complete')![0][0].hitRubrics).toContain('美元外溢')
    expect(wrapper.emitted('complete')![0][0].hitRubrics).toContain('本国条件')
  })
})
