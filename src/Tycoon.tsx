import { useEffect, useState } from 'react'
import {
  BUILDINGS,
  CLICK_UPGRADE_MAX,
  SPONSOR_BOOST_MULTIPLIER,
  SPONSOR_BOOST_SECONDS,
  TYCOON_GOAL,
  UPGRADE_NAMES,
  buildingCost,
  clickUpgradeCost,
} from './data'
import { formatNumber } from './format'
import { useGame } from './GameProvider'
import {
  buildingIncome,
  nextBuildingUpgrade,
  tycoonClickValue,
  tycoonPerSecond,
} from './state'

const HEADLINES = [
  "10 Reasons You Won't Believe #7 Is Also Clickbait",
  'Doctors HATE This Website',
  'You Will Never Guess What Happens Next (An Ad)',
  'This Cat Did Something. Click To Find Out.',
  'Scientists Baffled By How Many Popups Fit On One Page',
]

// The golden-cookie of this game: a sponsor that briefly pops up and
// multiplies income if you catch it in time.
function Sponsor() {
  const { state, dispatch, float } = useGame()
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (spot) {
      const timer = setTimeout(() => setSpot(null), 9000)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(
      () => setSpot({ x: 5 + Math.random() * 80, y: 10 + Math.random() * 70 }),
      (45 + Math.random() * 60) * 1000,
    )
    return () => clearTimeout(timer)
  }, [spot])

  if (!spot || state.tycoon.boostLeft > 0) return null

  return (
    <button
      className="sponsor"
      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
      onClick={(e) => {
        dispatch({ type: 'sponsorBoost' })
        float(
          `SPONSORED! ×${SPONSOR_BOOST_MULTIPLIER} for ${SPONSOR_BOOST_SECONDS}s`,
          e,
        )
        setSpot(null)
      }}
    >
      💰 Sponsored!
    </button>
  )
}

function WinModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useGame()
  return (
    <div className="modal-backdrop clean">
      <div className="modal win" role="dialog" aria-label="You won">
        <div className="newsletter-emoji">🏆</div>
        <h2>Most Annoying Website on the Internet</h2>
        <p>
          Your site has cookie banners, newsletter modals, autoplay videos, a
          chatbot, impossible CAPTCHAs, a paywall and a 40,000-word life story.
          It is perfect. It is terrible.
        </p>
        <p>
          Somewhere out there, a visitor just landed on it. All they want is to
          scroll down and play the little game at the bottom of the page...
        </p>
        <div className="win-actions">
          <button
            className="buy-button"
            onClick={() => dispatch({ type: 'newGamePlus' })}
          >
            Become the visitor (New Game+)
          </button>
          <button className="link-button" onClick={onClose}>
            Keep building
          </button>
        </div>
        <p className="shop-hint">
          New Game+ starts over with ×{2 ** (state.jaded + 1)} patience. You've
          seen it all before.
        </p>
      </div>
    </div>
  )
}

export function Tycoon() {
  const { state, dispatch, float } = useGame()
  const tycoon = state.tycoon
  const [headline, setHeadline] = useState(HEADLINES[0])
  const [showWin, setShowWin] = useState(true)
  const perSecond = tycoonPerSecond(tycoon)
  const clickValue = tycoonClickValue(tycoon)
  const clickCost = clickUpgradeCost(tycoon.clickLevel)
  const progress = Math.min(1, tycoon.earned / TYCOON_GOAL)

  return (
    <section className="tycoon">
      <header className="tycoon-header">
        <div>
          <h2>🕹️ Webmaster Tycoon</h2>
          <p>Build the most annoying website on the internet.</p>
        </div>
        <div className="tycoon-money">
          <div className="tycoon-cash">${formatNumber(tycoon.money)}</div>
          <div className="tycoon-rate">
            ${formatNumber(perSecond)}/s
            {tycoon.boostLeft > 0 && (
              <span className="boost">
                {' '}
                · SPONSORED ×{SPONSOR_BOOST_MULTIPLIER} (
                {Math.ceil(tycoon.boostLeft)}s)
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="tycoon-goal">
        <span>🏆 Most Annoying Website Award</span>
        <div className="bar gold">
          <div style={{ width: `${progress * 100}%` }} />
        </div>
        <span>
          ${formatNumber(tycoon.earned)} / ${formatNumber(TYCOON_GOAL)} earned
        </span>
      </div>

      <div className="tycoon-body">
        <div className="tycoon-left">
          <button
            className="clickbait"
            onClick={(e) => {
              dispatch({ type: 'tycoonClick' })
              float(`+$${formatNumber(clickValue)}`, e)
              setHeadline(
                HEADLINES[Math.floor(Math.random() * HEADLINES.length)],
              )
            }}
          >
            <span className="clickbait-label">📝 Publish clickbait</span>
            <span className="clickbait-headline">“{headline}”</span>
            <span className="clickbait-value">
              +${formatNumber(clickValue)}
            </span>
          </button>
          <button
            className="upgrade-chip"
            disabled={
              tycoon.clickLevel >= CLICK_UPGRADE_MAX || tycoon.money < clickCost
            }
            onClick={() => dispatch({ type: 'buyClickUpgrade' })}
          >
            {tycoon.clickLevel >= CLICK_UPGRADE_MAX
              ? '✍️ Peak clickbait reached'
              : `✍️ ALL CAPS HEADLINES lv ${tycoon.clickLevel + 1} · $${formatNumber(clickCost)}`}
          </button>

          <div className="mini-site" aria-label="Your website">
            <div className="mini-site-bar">🔒 your-site.biz</div>
            <div className="mini-site-body">
              {tycoon.owned.every((n) => n === 0) ? (
                <span className="mini-site-empty">
                  A clean, empty website. Disgusting.
                </span>
              ) : (
                BUILDINGS.map((b, i) =>
                  Array.from(
                    { length: Math.min(tycoon.owned[i], 30) },
                    (_, n) => <span key={`${i}-${n}`}>{b.icon}</span>,
                  ),
                )
              )}
            </div>
          </div>
        </div>

        <div className="tycoon-buildings">
          {BUILDINGS.map((building, i) => {
            const owned = tycoon.owned[i]
            const cost = buildingCost(building, owned)
            const upgrade = nextBuildingUpgrade(tycoon, i)
            // Hide buildings until you're close to affording the previous one.
            const revealed =
              i === 0 ||
              tycoon.owned[i - 1] > 0 ||
              tycoon.earned >= building.baseCost / 2
            if (!revealed) {
              return (
                <div key={building.name} className="building locked">
                  ??? · ${formatNumber(building.baseCost)}
                </div>
              )
            }
            return (
              <div key={building.name} className="building">
                <button
                  className="building-buy"
                  disabled={tycoon.money < cost}
                  onClick={() => dispatch({ type: 'buyBuilding', index: i })}
                >
                  <span className="building-icon">{building.icon}</span>
                  <span className="building-text">
                    <span className="building-name">{building.name}</span>
                    <span className="building-desc">
                      {building.description}
                    </span>
                    <span className="building-income">
                      ${formatNumber(buildingIncome(tycoon, i))}/s each
                    </span>
                  </span>
                  <span className="building-side">
                    <span className="building-owned">{owned}</span>
                    <span className="building-cost">${formatNumber(cost)}</span>
                  </span>
                </button>
                {upgrade?.unlocked && (
                  <button
                    className="upgrade-chip"
                    disabled={tycoon.money < upgrade.cost}
                    onClick={() =>
                      dispatch({ type: 'buyBuildingUpgrade', index: i })
                    }
                  >
                    ⬆ {UPGRADE_NAMES[upgrade.level]}: {building.name} ×2 · $
                    {formatNumber(upgrade.cost)}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <Sponsor />
      {tycoon.won && showWin && <WinModal onClose={() => setShowWin(false)} />}
    </section>
  )
}
