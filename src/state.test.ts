import { describe, expect, it } from 'vitest'
import {
  BUILDINGS,
  FIXES,
  ESCAPE_BOUNTY_MIN,
  FIX_MULTIPLIER,
  HYPE_PER_CLICK,
  SEED_MONEY_CAP,
  TYCOON_GOAL,
  UPGRADE_THRESHOLDS,
  VIRAL_CLICK_MULTIPLIER,
  VIRAL_INCOME_MULTIPLIER,
  VIRAL_SECONDS,
} from './data'
import {
  dismissReward,
  initialState,
  isCleaned,
  patienceMultiplier,
  reducer,
  tycoonClickValue,
  tycoonPerSecond,
  type GameState,
} from './state'

const withPatience = (patience: number, state = initialState(0, 0)) => ({
  ...state,
  patience,
})

describe('annoying website reducer', () => {
  it('rewards dismissing annoyances with patience', () => {
    const state = reducer(initialState(0, 0), { type: 'dismiss', weight: 3 })
    expect(state.patience).toBe(3)
    expect(state.dismissed).toBe(1)
  })

  it('gives the intern half the reward', () => {
    const state = initialState(0, 0)
    expect(dismissReward(state, 4, true)).toBe(2)
  })

  it('does not buy a fix you cannot afford', () => {
    const state = reducer(withPatience(1), { type: 'buyFix', id: 'cookie' })
    expect(state.fixed).toEqual([])
    expect(state.patience).toBe(1)
  })

  it('buying a fix spends patience and raises the multiplier', () => {
    const state = reducer(withPatience(100), { type: 'buyFix', id: 'cookie' })
    expect(state.fixed).toEqual(['cookie'])
    expect(state.patience).toBe(85)
    expect(patienceMultiplier(state)).toBe(FIX_MULTIPLIER)
  })

  it('cannot buy the same fix twice', () => {
    let state = reducer(withPatience(100), { type: 'buyFix', id: 'cookie' })
    state = reducer(state, { type: 'buyFix', id: 'cookie' })
    expect(state.fixed).toEqual(['cookie'])
  })

  it('caps the intern at its max level', () => {
    let state: GameState = withPatience(1e12)
    for (let i = 0; i < 20; i++)
      state = reducer(state, { type: 'buyLevel', id: 'intern' })
    expect(state.levels.intern).toBe(8)
  })

  it('unlocks the tycoon game and seeds it once every fix is bought', () => {
    let state: GameState = withPatience(1e6)
    for (const fix of FIXES)
      state = reducer(state, { type: 'buyFix', id: fix.id })
    expect(isCleaned(state)).toBe(true)
    expect(state.cleanedAt).not.toBeNull()
    expect(state.patience).toBe(0)
    expect(state.tycoon.money).toBe(SEED_MONEY_CAP)
  })

  it('ignores tycoon clicks before the site is cleaned', () => {
    const state = reducer(initialState(0, 0), { type: 'tycoonClick' })
    expect(state.tycoon.money).toBe(0)
  })

  it('wins the tycoon game at the goal and new game+ keeps jaded', () => {
    let state: GameState = withPatience(1e6)
    for (const fix of FIXES)
      state = reducer(state, { type: 'buyFix', id: fix.id })
    state = {
      ...state,
      tycoon: { ...state.tycoon, money: 1e12, owned: BUILDINGS.map(() => 0) },
    }
    state = reducer(state, { type: 'buyBuilding', index: 7 })
    state = reducer(state, {
      type: 'tick',
      dt: TYCOON_GOAL / BUILDINGS[7].income,
    })
    expect(state.tycoon.won).toBe(true)
    const next = reducer(state, { type: 'newGamePlus' })
    expect(next.jaded).toBe(1)
    expect(next.fixed).toEqual([])
    expect(patienceMultiplier(next)).toBe(2)
  })

  it('needs enough buildings before a building upgrade unlocks', () => {
    let state: GameState = withPatience(1e6)
    for (const fix of FIXES)
      state = reducer(state, { type: 'buyFix', id: fix.id })
    state = { ...state, tycoon: { ...state.tycoon, money: 1e6 } }
    const locked = reducer(state, { type: 'buyBuildingUpgrade', index: 0 })
    expect(locked.tycoon.upgrades[0]).toBe(0)
    for (let i = 0; i < UPGRADE_THRESHOLDS[0] - 1; i++)
      state = reducer(state, { type: 'buyBuilding', index: 0 })
    const stillLocked = reducer(state, { type: 'buyBuildingUpgrade', index: 0 })
    expect(stillLocked.tycoon.upgrades[0]).toBe(0)
    state = reducer(state, { type: 'buyBuilding', index: 0 })
    state = reducer(state, { type: 'buyBuildingUpgrade', index: 0 })
    expect(state.tycoon.upgrades[0]).toBe(1)
  })

  it('goes viral after enough clicks, boosting clicks and income', () => {
    let state = cleanedState()
    state = {
      ...state,
      tycoon: { ...state.tycoon, owned: replaceFirst(state.tycoon.owned, 10) },
    }
    const normalClick = tycoonClickValue(state.tycoon)
    const normalRate = tycoonPerSecond(state.tycoon)
    const clicksToViral = Math.ceil(1 / HYPE_PER_CLICK)
    for (let i = 0; i < clicksToViral; i++)
      state = reducer(state, { type: 'tycoonClick' })
    expect(state.tycoon.viralLeft).toBe(VIRAL_SECONDS)
    expect(state.tycoon.hype).toBe(0)
    expect(tycoonClickValue(state.tycoon)).toBeCloseTo(
      normalClick * VIRAL_CLICK_MULTIPLIER,
    )
    expect(tycoonPerSecond(state.tycoon)).toBeCloseTo(
      normalRate * VIRAL_INCOME_MULTIPLIER,
    )
    state = reducer(state, { type: 'tick', dt: VIRAL_SECONDS })
    expect(state.tycoon.viralLeft).toBe(0)
  })

  it('drains hype only after you stop clicking for a while', () => {
    let state = reducer(cleanedState(), { type: 'tycoonClick' })
    const hype = state.tycoon.hype
    state = reducer(state, { type: 'tick', dt: 1 })
    expect(state.tycoon.hype).toBe(hype)
    state = reducer(state, { type: 'tick', dt: 5 })
    expect(state.tycoon.hype).toBe(0)
  })

  it('pays a bounty for catching an escaping visitor', () => {
    const state = cleanedState()
    const money = state.tycoon.money
    const next = reducer(state, { type: 'catchVisitor' })
    expect(next.tycoon.money - money).toBe(ESCAPE_BOUNTY_MIN)
    expect(next.tycoon.caught).toBe(1)
  })
})

function cleanedState(): GameState {
  let state: GameState = withPatience(0)
  state = { ...state, fixed: FIXES.map((f) => f.id) }
  return state
}

function replaceFirst(list: number[], value: number) {
  return list.map((v, i) => (i === 0 ? value : v))
}
