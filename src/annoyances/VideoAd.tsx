import { useEffect, useState } from 'react'
import { useGame } from '../GameProvider'
import { isFixed } from '../state'
import { pick, useRecurring } from '../useRecurring'

const SLOGANS = [
  'FEEL THE DEALS',
  'MEGA ULTRA SALE',
  'BUY NOW THINK NEVER',
  'YOUR WALLET CALLED',
]

export function VideoAd() {
  const { state, dismiss, float } = useGame()
  const [visible, hide] = useRecurring(!isFixed(state, 'video'), 30, 45, 25)
  const [countdown, setCountdown] = useState(5)
  const [slogan, setSlogan] = useState(SLOGANS[0])

  useEffect(() => {
    if (!visible) return
    setCountdown(5)
    setSlogan(pick(SLOGANS))
    const timer = setInterval(
      () => setCountdown((c) => Math.max(0, c - 1)),
      1000,
    )
    return () => clearInterval(timer)
  }, [visible])

  if (!visible) return null

  return (
    <div className="video-ad" role="complementary" aria-label="Video ad">
      <div className="video-screen">
        <div className="video-slogan">🔊 {slogan} 🔊</div>
        <div className="video-progress">
          <div style={{ width: `${(5 - countdown) * 20}%` }} />
        </div>
      </div>
      <div className="video-controls">
        <button onClick={(e) => float('Muting is a Premium feature 👑', e)}>
          🔇
        </button>
        <span>Ad · 1 of 7</span>
        {countdown > 0 ? (
          <span className="video-skip waiting">Skip in {countdown}</span>
        ) : (
          <button
            className="video-skip"
            onClick={(e) => {
              dismiss(4, e)
              hide()
            }}
          >
            Skip Ad ⏭
          </button>
        )}
      </div>
    </div>
  )
}
