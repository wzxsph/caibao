export const DEMO_WALLET_STORAGE_KEY = 'caibao-demo-wallet:v1'
export const DEMO_FINANCE_LEVEL = 28
export const DEMO_WALLET_EVENT = 'caibao-demo-wallet-change'

export interface DemoWallet {
  version: 1
  level: 28
  coins: number
  rewardedKeys: string[]
}

export interface DemoCoinAward extends DemoWallet {
  awarded: boolean
}

function emptyWallet(): DemoWallet {
  return { version: 1, level: DEMO_FINANCE_LEVEL, coins: 0, rewardedKeys: [] }
}

function storage(): Storage | null {
  return typeof localStorage === 'undefined' ? null : localStorage
}

export function loadDemoWallet(): DemoWallet {
  const target = storage()
  if (!target) return emptyWallet()
  const raw = target.getItem(DEMO_WALLET_STORAGE_KEY)
  if (!raw) return emptyWallet()
  try {
    const parsed = JSON.parse(raw) as Partial<DemoWallet>
    if (
      parsed.version === 1 &&
      parsed.level === DEMO_FINANCE_LEVEL &&
      Number.isInteger(parsed.coins) &&
      Number(parsed.coins) >= 0 &&
      Array.isArray(parsed.rewardedKeys)
    ) {
      return {
        version: 1,
        level: DEMO_FINANCE_LEVEL,
        coins: Number(parsed.coins),
        rewardedKeys: [...new Set(parsed.rewardedKeys.filter((key) => typeof key === 'string'))]
      }
    }
  } catch {
    // Invalid local demo state is discarded instead of affecting playback.
  }
  target.removeItem(DEMO_WALLET_STORAGE_KEY)
  return emptyWallet()
}

export function awardDemoCoins(rewardKey: string, amount: number): DemoCoinAward {
  const wallet = loadDemoWallet()
  const safeAmount = Number.isInteger(amount) && amount > 0 ? amount : 0
  if (!rewardKey || safeAmount === 0 || wallet.rewardedKeys.includes(rewardKey)) {
    return { ...wallet, awarded: false }
  }
  const next: DemoWallet = {
    ...wallet,
    coins: wallet.coins + safeAmount,
    rewardedKeys: [...wallet.rewardedKeys, rewardKey]
  }
  storage()?.setItem(DEMO_WALLET_STORAGE_KEY, JSON.stringify(next))
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(DEMO_WALLET_EVENT))
  return { ...next, awarded: true }
}
