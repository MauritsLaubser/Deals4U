import { useState } from 'react'
import { FIXES, LEVEL_UPGRADES, SEED_MONEY_CAP, levelCost } from './data'
import { formatDuration, formatNumber } from './format'
import { useGame } from './GameProvider'
import {
  clearSave,
  dismissReward,
  isCleaned,
  isFixed,
  patienceMultiplier,
  patiencePerSecond,
} from './state'

export const scrollToGame = () =>
  document.getElementById('game')?.scrollIntoView({ behavior: 'smooth' })

export function Shop() {
  const { state, dispatch } = useGame()
  const [open, setOpen] = useState(false)
  const cleaned = isCleaned(state)
  const remaining = FIXES.filter((f) => !isFixed(state, f.id))
  const done = FIXES.filter((f) => isFixed(state, f.id))

  // Two clicks to reset: no browser confirm() dialog needed.
  const [confirmReset, setConfirmReset] = useState(false)
  const reset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 4000)
      return
    }
    clearSave()
    setConfirmReset(false)
    dispatch({ type: 'reset' })
  }

  return (
    <>
      <button
        className={`shop-toggle ${open ? 'hidden' : ''}`}
        onClick={() => setOpen(true)}
      >
        🔧 {cleaned ? 'Done!' : `${formatNumber(state.patience)} 🧘`}
      </button>
      <aside
        className={`shop ${open ? 'open' : ''}`}
        aria-label="Website repair kit"
      >
        <div className="shop-header">
          <h2>🔧 Website Repair Kit</h2>
          <button
            className="shop-close"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {cleaned ? (
          <div className="shop-done">
            <div className="shop-done-emoji">✨</div>
            <h3>Website repaired!</h3>
            <p>
              It took you{' '}
              <strong>
                {formatDuration(
                  (state.cleanedAt ?? Date.now()) - state.startedAt,
                )}
              </strong>{' '}
              and <strong>{formatNumber(state.dismissed, 0)}</strong> closed
              annoyances. Your leftover patience became seed money (up to $
              {SEED_MONEY_CAP}).
            </p>
            <button
              className="buy-button"
              onClick={() => {
                setOpen(false)
                scrollToGame()
              }}
            >
              Finally play the game ⬇
            </button>
          </div>
        ) : (
          <>
            <div className="patience">
              <div className="patience-label">Patience</div>
              <div className="patience-value">
                🧘 {formatNumber(state.patience)}
              </div>
              <div className="patience-stats">
                <span>+{formatNumber(dismissReward(state, 1))} per close</span>
                <span>+{formatNumber(patiencePerSecond(state))}/s</span>
                <span>×{formatNumber(patienceMultiplier(state), 2)} calm</span>
              </div>
              <p className="shop-hint">
                Close annoyances to gain patience. Spend it to fix this website.
              </p>
            </div>

            <div className="fix-progress">
              <div className="fix-progress-label">
                Website fixed: {done.length}/{FIXES.length}
              </div>
              <div className="bar">
                <div
                  style={{ width: `${(done.length / FIXES.length) * 100}%` }}
                />
              </div>
            </div>

            <h3 className="shop-section">Fixes</h3>
            <p className="shop-hint">Each fix also makes you ×1.3 calmer.</p>
            {remaining.map((fix) => {
              const affordable = state.patience >= fix.cost
              return (
                <button
                  key={fix.id}
                  className={`shop-item ${affordable ? 'affordable' : ''}`}
                  disabled={!affordable}
                  onClick={() => dispatch({ type: 'buyFix', id: fix.id })}
                >
                  <span className="shop-icon">{fix.icon}</span>
                  <span className="shop-text">
                    <span className="shop-name">{fix.name}</span>
                    <span className="shop-desc">{fix.description}</span>
                  </span>
                  <span className="shop-cost">🧘 {formatNumber(fix.cost)}</span>
                </button>
              )
            })}

            <h3 className="shop-section">Coping mechanisms</h3>
            {LEVEL_UPGRADES.map((upgrade) => {
              const level = state.levels[upgrade.id]
              const maxed = upgrade.max !== undefined && level >= upgrade.max
              const cost = levelCost(upgrade, level)
              const lockedByFix =
                upgrade.id === 'intern' && isFixed(state, 'popups')
              const affordable =
                !maxed && !lockedByFix && state.patience >= cost
              return (
                <button
                  key={upgrade.id}
                  className={`shop-item ${affordable ? 'affordable' : ''}`}
                  disabled={!affordable}
                  onClick={() => dispatch({ type: 'buyLevel', id: upgrade.id })}
                >
                  <span className="shop-icon">{upgrade.icon}</span>
                  <span className="shop-text">
                    <span className="shop-name">
                      {upgrade.name}{' '}
                      <span className="shop-level">lv {level}</span>
                    </span>
                    <span className="shop-desc">
                      {lockedByFix
                        ? 'Retired. No pop-ups left to close.'
                        : upgrade.description}
                    </span>
                  </span>
                  <span className="shop-cost">
                    {maxed ? 'MAX' : `🧘 ${formatNumber(cost)}`}
                  </span>
                </button>
              )
            })}

            {done.length > 0 && (
              <>
                <h3 className="shop-section">Already fixed</h3>
                <div className="fixed-list">
                  {done.map((fix) => (
                    <span key={fix.id} title={fix.name}>
                      {fix.icon} ✓
                    </span>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div className="shop-footer">
          {state.jaded > 0 && (
            <span className="jaded">😑 Jaded ×{2 ** state.jaded} patience</span>
          )}
          <button className="link-button" onClick={reset}>
            {confirmReset ? 'Click again to wipe everything' : 'Reset save'}
          </button>
        </div>
      </aside>
    </>
  )
}
