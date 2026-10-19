import { describe, expect, it } from 'vitest'
import {
  BUILDINGS,
  FIXES,
  FIX_MULTIPLIER,
  SEED_MONEY_CAP,
  TYCOON_GOAL,
} from './data'
import {
  dismissReward,
  initialState,
  isCleaned,
  patienceMultiplier,
  reducer,
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
    state = reducer(state, { type: 'buyBuilding', index: 0 })
    state = reducer(state, { type: 'buyBuildingUpgrade', index: 0 })
    expect(state.tycoon.upgrades[0]).toBe(1)
  })
})
