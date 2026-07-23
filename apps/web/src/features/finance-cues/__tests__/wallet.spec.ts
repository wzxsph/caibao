import { beforeEach, describe, expect, it } from 'vitest'
import { awardDemoCoins, loadDemoWallet } from '../wallet'

describe('Caibao demo wallet', () => {
  beforeEach(() => localStorage.clear())

  it('keeps level 28 as a fixed social demo identity', () => {
    expect(loadDemoWallet()).toMatchObject({ level: 28, coins: 0 })
  })

  it('awards one objective cue once, including after a reload', () => {
    expect(awardDemoCoins('video-1:cue-1', 1)).toMatchObject({ awarded: true, coins: 1 })
    expect(awardDemoCoins('video-1:cue-1', 1)).toMatchObject({ awarded: false, coins: 1 })
    expect(loadDemoWallet()).toMatchObject({ level: 28, coins: 1 })
  })

  it('does not award non-positive rewards', () => {
    expect(awardDemoCoins('video-1:explore', 0)).toMatchObject({ awarded: false, coins: 0 })
  })
})
