import { useEffect, useState } from 'react'
import { spawnPopupAd } from './pests/Windows98'
import { FIXES } from './data'
import { useGame } from './GameProvider'
import { isCleaned, isFixed } from './state'
import { Tycoon } from './Tycoon'

const TIPS = [
  'Tip: Websites load faster without 40 tracking scripts.',
  'Tip: The real game was the popups we closed along the way.',
  'Tip: Botty is not a real person. Botty is barely a bot.',
  'Tip: Patience is a resource. Spend it wisely.',
  'Tip: "Reject all" can be caught if you are persistent.',
  'Loading assets... loading more ads... loading assets...',
]

function AdblockWall() {
  const { float } = useGame()
  const [shake, setShake] = useState(false)
  return (
    <div
      className={`vibes-wall ${shake ? 'shake' : ''}`}
      onAnimationEnd={() => setShake(false)}
    >
      <div className="big-emoji">😡</div>
      <h3>AdBlock Detected!</h3>
      <p>
        We noticed you're using an ad blocker. (You might not be. We check by
        vibes.) Please disable it to play.
      </p>
      <button
        onClick={(e) => {
          setShake(true)
          float("No you didn't.", e)
        }}
      >
        I've disabled it!
      </button>
    </div>
  )
}

export function GameFrame() {
  const { state, float } = useGame()
  const [tip, setTip] = useState(0)
  const cleaned = isCleaned(state)
  const progress = state.fixed.length / FIXES.length

  useEffect(() => {
    const timer = setInterval(() => setTip((t) => (t + 1) % TIPS.length), 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div id="game" className={`game-frame ${cleaned ? 'ready' : ''}`}>
      {cleaned ? (
        <Tycoon />
      ) : (
        <div className="game-loading">
          <div className="game-logo">
            🕹️ WEBMASTER
            <br />
            TYCOON
          </div>
          <p className="game-tagline">The #1 free browser game!* (*loading)</p>
          <div className="bar loading">
            <div style={{ width: `${Math.max(3, progress * 100)}%` }} />
          </div>
          <div className="game-percent">
            Loading... {Math.floor(progress * 100)}%
          </div>
          <p className="game-tip">{TIPS[tip]}</p>
          <button
            className="game-play"
            onClick={(e) => {
              float('Still loading! Enjoy an ad meanwhile 📺', e)
              if (!isFixed(state, 'popups')) spawnPopupAd()
            }}
          >
            ▶ PLAY NOW
          </button>
          <p className="shop-hint">
            (The game loads a bit more with every fix to the website.)
          </p>
          {!isFixed(state, 'adblock') && <AdblockWall />}
        </div>
      )}
    </div>
  )
}
