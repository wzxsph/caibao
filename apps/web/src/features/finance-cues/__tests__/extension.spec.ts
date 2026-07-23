import { describe, expect, it } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import FinanceCueExtension from '../components/FinanceCueExtension.vue'
import { loadDemoWallet } from '../wallet'
import type { MediaClockState, VideoContext } from '@/features/video-extensions/contracts'

const context: VideoContext = {
  videoId: 'finance-fed-demo',
  financeExperienceId: 'finance-fed-v1',
  item: { mediaFingerprint: 'finance-real-venezuela' },
  position: { uniqueId: 'home', index: 0 }
}

function clock(currentTimeMs: number): MediaClockState {
  return {
    currentTimeMs,
    durationMs: 212_442,
    paused: false,
    muted: true,
    seeking: false,
    ended: false,
    playbackRate: 1
  }
}

describe('FinanceCueExtension', () => {
  it('fails closed when the video id or media fingerprint does not match the content package', async () => {
    for (const mismatchedContext of [
      { ...context, videoId: 'another-video' },
      { ...context, item: { mediaFingerprint: 'another-cut' } }
    ]) {
      const wrapper = mount(FinanceCueExtension, {
        props: { context: mismatchedContext, clock: clock(15_100) },
        global: { plugins: [createPinia()] }
      })
      await flushPromises()
      expect(wrapper.find('[data-testid="finance-cue-extension"]').exists()).toBe(false)
      wrapper.unmount()
    }
  })

  it('keeps the invitation passive, then requests pause and release around the interaction', async () => {
    localStorage.clear()
    const wrapper = mount(FinanceCueExtension, {
      props: { context, clock: clock(0) },
      global: { plugins: [createPinia()] },
      attachTo: document.body
    })
    await flushPromises()
    await wrapper.setProps({ clock: clock(15_100) })
    await flushPromises()

    expect(wrapper.find('[data-testid="finance-cue-pill"]').exists()).toBe(true)
    expect(wrapper.emitted('pause-for-interaction')).toBeUndefined()
    await wrapper.get('.cue-main').trigger('click')
    expect(wrapper.find('[data-testid="caibao-half-sheet"]').exists()).toBe(true)
    expect(wrapper.emitted('pause-for-interaction')).toEqual([
      [
        expect.objectContaining({
          type: 'pause-for-interaction',
          interactionId: expect.stringContaining('context-policy-rate')
        })
      ]
    ])
    expect(wrapper.emitted('sheet-open-change')?.at(-1)).toEqual([true])

    await wrapper.get('button[aria-label="关闭"]').trigger('click')
    expect(wrapper.emitted('release-interaction')?.at(-1)).toEqual([
      expect.objectContaining({
        type: 'release-interaction',
        interactionId: expect.stringContaining('context-policy-rate'),
        reason: 'closed',
        allowResume: true
      })
    ])
    wrapper.unmount()
  })

  it('releases the interaction with a typed skipped reason', async () => {
    localStorage.clear()
    const wrapper = mount(FinanceCueExtension, {
      props: { context, clock: clock(0) },
      global: { plugins: [createPinia()] }
    })
    await flushPromises()
    await wrapper.setProps({ clock: clock(15_100) })
    await flushPromises()
    await wrapper.get('.cue-main').trigger('click')
    await wrapper.get('[data-testid="finance-skip-interaction"]').trigger('click')

    expect(wrapper.emitted('release-interaction')?.at(-1)).toEqual([
      expect.objectContaining({ reason: 'skipped', allowResume: true })
    ])
    expect(wrapper.find('[data-testid="caibao-half-sheet"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('opens a timeline revisit without requesting a seek', async () => {
    localStorage.clear()
    const wrapper = mount(FinanceCueExtension, {
      props: { context, clock: clock(42_000) },
      global: { plugins: [createPinia()] }
    })
    await flushPromises()

    await wrapper.get('button[aria-label^="回看："]').trigger('click')

    expect(wrapper.find('[data-testid="caibao-half-sheet"]').exists()).toBe(true)
    expect(wrapper.emitted('request-seek')).toBeUndefined()
    expect(wrapper.emitted('pause-for-interaction')).toHaveLength(1)
    wrapper.unmount()
  })

  it('awards a coin only after an objective answer is correct', async () => {
    localStorage.clear()
    const wrapper = mount(FinanceCueExtension, {
      props: { context, clock: clock(0) },
      global: { plugins: [createPinia()] }
    })
    await flushPromises()
    await wrapper
      .get('button[aria-label="回看：从降息到股票估值，中间缺了哪一步？"]')
      .trigger('click')

    const initialAnswers = wrapper.findAll('.option-list button')
    await initialAnswers[1].trigger('click')
    expect(loadDemoWallet().coins).toBe(0)
    expect(wrapper.text()).toContain('再想一次')

    await wrapper.get('.feedback button').trigger('click')
    const answers = wrapper.findAll('.option-list button')
    await answers[0].trigger('click')

    expect(loadDemoWallet().coins).toBe(1)
    expect(wrapper.text()).toContain('融资成本与折现率')
    wrapper.unmount()
  })
})
