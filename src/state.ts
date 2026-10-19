import {
  BREATH_PER_LEVEL,
  BUILDINGS,
  CLICK_UPGRADE_MAX,
  ESCAPE_BOUNTY_MIN,
  ESCAPE_BOUNTY_SECONDS,
  FIXES,
  FIX_MULTIPLIER,
  HYPE_DRAIN_DELAY,
  HYPE_DRAIN_PER_SECOND,
  HYPE_PER_CLICK,
  INTERN_AUTO_WEIGHT,
  LEVEL_UPGRADES,
  SEED_MONEY_CAP,
  SPONSOR_BOOST_MULTIPLIER,
  SPONSOR_BOOST_SECONDS,
  TYCOON_GOAL,
  UPGRADE_COST_FACTORS,
  UPGRADE_THRESHOLDS,
  VIRAL_CLICK_MULTIPLIER,
  VIRAL_INCOME_MULTIPLIER,
  VIRAL_SECONDS,
  buildingCost,
  clickUpgradeCost,
  levelCost,
  type FixId,
  type LevelId,
} from './data'

export type TycoonState = {
  money: number
  earned: number
  owned: number[]
  upgrades: number[]
  clickLevel: number
  boostLeft: number
  // 0..1, fills as you click; going viral empties it.
  hype: number
  sinceLastClick: number
  viralLeft: number
  caught: number
  won: boolean
}

export type GameState = {
  patience: number
  totalPatience: number
  dismissed: number
  fixed: FixId[]
  levels: Record<LevelId, number>
  // Each completed run makes you more jaded: ×2 patience per run.
  jaded: number
  startedAt: number
  cleanedAt: number | null
  tycoon: TycoonState
}

export type Action =
  | { type: 'tick'; dt: number }
  | { type: 'dismiss'; weight: number; auto?: boolean }
  | { type: 'buyFix'; id: FixId }
  | { type: 'buyLevel'; id: LevelId }
  | { type: 'tycoonClick' }
  | { type: 'buyBuilding'; index: number }
  | { type: 'buyBuildingUpgrade'; index: number }
  | { type: 'buyClickUpgrade' }
  | { type: 'sponsorBoost' }
  | { type: 'catchVisitor' }
  | { type: 'newGamePlus' }
  | { type: 'reset' }

export const initialTycoon = (): TycoonState => ({
  money: 0,
  earned: 0,
  owned: BUILDINGS.map(() => 0),
  upgrades: BUILDINGS.map(() => 0),
  clickLevel: 0,
  boostLeft: 0,
  hype: 0,
  sinceLastClick: 0,
  viralLeft: 0,
  caught: 0,
  won: false,
})

export const initialState = (jaded = 0, now = Date.now()): GameState => ({
  patience: 0,
  totalPatience: 0,
  dismissed: 0,
  fixed: [],
  levels: { skin: 0, breath: 0, intern: 0 },
  jaded,
  startedAt: now,
  cleanedAt: null,
  tycoon: initialTycoon(),
})

// ---- Selectors ----

export const isFixed = (state: GameState, id: FixId) => state.fixed.includes(id)

export const isCleaned = (state: GameState) =>
  state.fixed.length === FIXES.length

export const patienceMultiplier = (state: GameState) =>
  FIX_MULTIPLIER ** state.fixed.length * 2 ** state.jaded

export const dismissReward = (state: GameState, weight: number, auto = false) =>
  weight *
  (1 + state.levels.skin) *
  patienceMultiplier(state) *
  (auto ? INTERN_AUTO_WEIGHT : 1)

export const patiencePerSecond = (state: GameState) =>
  state.levels.breath * BREATH_PER_LEVEL * patienceMultiplier(state)

export const buildingIncome = (tycoon: TycoonState, index: number) =>
  BUILDINGS[index].income * 2 ** tycoon.upgrades[index]

export const tycoonPerSecond = (tycoon: TycoonState) =>
  BUILDINGS.reduce(
    (sum, _, i) => sum + buildingIncome(tycoon, i) * tycoon.owned[i],
    0,
  ) *
  (tycoon.boostLeft > 0 ? SPONSOR_BOOST_MULTIPLIER : 1) *
  (tycoon.viralLeft > 0 ? VIRAL_INCOME_MULTIPLIER : 1)

// A click is worth more with each click upgrade, plus a slice of your income.
export const tycoonClickValue = (tycoon: TycoonState) =>
  (1 +
    2 * tycoon.clickLevel +
    tycoonPerSecond(tycoon) * 0.01 * tycoon.clickLevel) *
  (tycoon.viralLeft > 0 ? VIRAL_CLICK_MULTIPLIER : 1)

export const visitorBounty = (tycoon: TycoonState) =>
  Math.max(ESCAPE_BOUNTY_MIN, tycoonPerSecond(tycoon) * ESCAPE_BOUNTY_SECONDS)

export const nextBuildingUpgrade = (tycoon: TycoonState, index: number) => {
  const level = tycoon.upgrades[index]
  if (level >= UPGRADE_THRESHOLDS.length) return null
  return {
    level,
    requires: UPGRADE_THRESHOLDS[level],
    cost: BUILDINGS[index].baseCost * UPGRADE_COST_FACTORS[level],
    unlocked: tycoon.owned[index] >= UPGRADE_THRESHOLDS[level],
  }
}

// ---- Reducer ----

function earnTycoon(tycoon: TycoonState, amount: number): TycoonState {
  const earned = tycoon.earned + amount
  return {
    ...tycoon,
    money: tycoon.money + amount,
    earned,
    won: tycoon.won || earned >= TYCOON_GOAL,
  }
}

function spendTycoon(
  state: GameState,
  cost: number,
  change: (tycoon: TycoonState) => Partial<TycoonState>,
): GameState {
  if (state.tycoon.money < cost) return state
  const tycoon = { ...state.tycoon, money: state.tycoon.money - cost }
  return { ...state, tycoon: { ...tycoon, ...change(tycoon) } }
}

const replaceAt = (list: number[], index: number, value: number) =>
  list.map((v, i) => (i === index ? value : v))

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'tick': {
      const gained = patiencePerSecond(state) * action.dt
      let next: GameState = {
        ...state,
        patience: state.patience + gained,
        totalPatience: state.totalPatience + gained,
      }
      if (isCleaned(state)) {
        const tycoon = earnTycoon(
          state.tycoon,
          tycoonPerSecond(state.tycoon) * action.dt,
        )
        const sinceLastClick = tycoon.sinceLastClick + action.dt
        const drain =
          sinceLastClick > HYPE_DRAIN_DELAY
            ? HYPE_DRAIN_PER_SECOND * action.dt
            : 0
        next = {
          ...next,
          tycoon: {
            ...tycoon,
            boostLeft: Math.max(0, tycoon.boostLeft - action.dt),
            viralLeft: Math.max(0, tycoon.viralLeft - action.dt),
            hype: Math.max(0, tycoon.hype - drain),
            sinceLastClick,
          },
        }
      }
      return next
    }
    case 'dismiss': {
      const reward = dismissReward(state, action.weight, action.auto)
      return {
        ...state,
        patience: state.patience + reward,
        totalPatience: state.totalPatience + reward,
        dismissed: state.dismissed + 1,
      }
    }
    case 'buyFix': {
      const fix = FIXES.find((f) => f.id === action.id)
      if (!fix || isFixed(state, fix.id) || state.patience < fix.cost) {
        return state
      }
      const next = {
        ...state,
        patience: state.patience - fix.cost,
        fixed: [...state.fixed, fix.id],
      }
      if (!isCleaned(next)) return next
      // Leftover patience becomes seed money for the game at the bottom.
      return {
        ...next,
        cleanedAt: Date.now(),
        tycoon: earnTycoon(
          next.tycoon,
          Math.min(Math.floor(next.patience), SEED_MONEY_CAP),
        ),
        patience: 0,
      }
    }
    case 'buyLevel': {
      const upgrade = LEVEL_UPGRADES.find((u) => u.id === action.id)
      if (!upgrade) return state
      const level = state.levels[upgrade.id]
      const cost = levelCost(upgrade, level)
      if (upgrade.max !== undefined && level >= upgrade.max) return state
      if (state.patience < cost) return state
      return {
        ...state,
        patience: state.patience - cost,
        levels: { ...state.levels, [upgrade.id]: level + 1 },
      }
    }
    case 'tycoonClick': {
      if (!isCleaned(state)) return state
      const tycoon = earnTycoon(state.tycoon, tycoonClickValue(state.tycoon))
      // No hype builds up while you're already viral.
      const hype = tycoon.viralLeft > 0 ? 0 : tycoon.hype + HYPE_PER_CLICK
      const viral = hype >= 1
      return {
        ...state,
        tycoon: {
          ...tycoon,
          hype: viral ? 0 : hype,
          viralLeft: viral ? VIRAL_SECONDS : tycoon.viralLeft,
          sinceLastClick: 0,
        },
      }
    }
    case 'catchVisitor': {
      if (!isCleaned(state)) return state
      const tycoon = earnTycoon(state.tycoon, visitorBounty(state.tycoon))
      return { ...state, tycoon: { ...tycoon, caught: tycoon.caught + 1 } }
    }
    case 'buyBuilding': {
      const building = BUILDINGS[action.index]
      if (!building) return state
      const cost = buildingCost(building, state.tycoon.owned[action.index])
      return spendTycoon(state, cost, (t) => ({
        owned: replaceAt(t.owned, action.index, t.owned[action.index] + 1),
      }))
    }
    case 'buyBuildingUpgrade': {
      const upgrade = nextBuildingUpgrade(state.tycoon, action.index)
      if (!upgrade || !upgrade.unlocked) return state
      return spendTycoon(state, upgrade.cost, (t) => ({
        upgrades: replaceAt(t.upgrades, action.index, upgrade.level + 1),
      }))
    }
    case 'buyClickUpgrade': {
      if (state.tycoon.clickLevel >= CLICK_UPGRADE_MAX) return state
      const cost = clickUpgradeCost(state.tycoon.clickLevel)
      return spendTycoon(state, cost, (t) => ({ clickLevel: t.clickLevel + 1 }))
    }
    case 'sponsorBoost':
      return {
        ...state,
        tycoon: { ...state.tycoon, boostLeft: SPONSOR_BOOST_SECONDS },
      }
    case 'newGamePlus':
      return initialState(state.jaded + 1)
    case 'reset':
      return initialState()
  }
}

// ---- Persistence ----

const SAVE_KEY = 'deals4u-save-v1'

export function saveGame(state: GameState) {
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ ...state, savedAt: Date.now() }),
    )
  } catch {
    // Storage can be unavailable (private mode, blocked site data).
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    // Nothing to clear.
  }
}

// Offline progress is capped so a forgotten tab doesn't break the pacing.
const MAX_OFFLINE_SECONDS = 60 * 60

export function loadGame(): GameState {
  const fresh = initialState()
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return fresh
    const saved = JSON.parse(raw) as Partial<GameState> & { savedAt?: number }
    const tycoon = { ...fresh.tycoon, ...saved.tycoon }
    const state: GameState = {
      ...fresh,
      ...saved,
      fixed: (saved.fixed ?? []).filter((id) => FIXES.some((f) => f.id === id)),
      levels: { ...fresh.levels, ...saved.levels },
      tycoon: {
        ...tycoon,
        owned: BUILDINGS.map((_, i) => tycoon.owned[i] ?? 0),
        upgrades: BUILDINGS.map((_, i) => tycoon.upgrades[i] ?? 0),
      },
    }
    const away = saved.savedAt ? (Date.now() - saved.savedAt) / 1000 : 0
    const dt = Math.min(Math.max(away, 0), MAX_OFFLINE_SECONDS)
    return dt > 0 ? reducer(state, { type: 'tick', dt }) : state
  } catch {
    return fresh
  }
}
