import { useState } from 'react'
import { useGame } from '../GameProvider'
import { isFixed } from '../state'
import { useRecurring } from '../useRecurring'

const VENDORS = [
  'Strictly Necessary Tracking',
  'Slightly Less Necessary Tracking',
  'Legitimate Interest (we are interested)',
  'Selling Your Data To Our Friends',
  'Selling Your Data To Our Enemies',
  'Mouse Movement Interpretive Dance Analysis',
  'Remembering What You Had For Lunch',
  'Cookie Monster Analytics',
  'Partner #4,182 (we forgot who)',
]

export function CookieBanner() {
  const { state, dismiss, float } = useGame()
  const [visible, hide] = useRecurring(!isFixed(state, 'cookie'), 18, 30, 1.5)
  const [manage, setManage] = useState(false)
  const [rejectPos, setRejectPos] = useState({ x: 0, y: 0 })
  const [dodges, setDodges] = useState(0)

  if (!visible) return null

  const close = (weight: number, event: React.MouseEvent) => {
    dismiss(weight, event)
    setManage(false)
    setDodges(0)
    setRejectPos({ x: 0, y: 0 })
    hide()
  }

  // The reject button runs away the first few times you go for it.
  const dodge = () => {
    if (dodges >= 3) return
    setDodges((d) => d + 1)
    setRejectPos({ x: (Math.random() - 0.5) * 300, y: -Math.random() * 60 })
  }

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="cookie-text">
        <strong>🍪 We value your privacy!!</strong> That's why we and our 4,182
        partners use cookies to track, store, sell, and lovingly remember
        everything you do. By existing near this website you agree.
      </div>
      {manage && (
        <div className="cookie-manage">
          {VENDORS.map((vendor) => (
            <label key={vendor}>
              <input type="checkbox" defaultChecked disabled /> {vendor}
            </label>
          ))}
          <p className="cookie-small">
            (These cannot be turned off. We just like showing you the list.)
          </p>
        </div>
      )}
      <div className="cookie-actions">
        <button className="cookie-accept" onClick={(e) => close(3, e)}>
          ACCEPT ALL 🍪
        </button>
        {manage ? (
          <button className="cookie-manage-btn" onClick={(e) => close(5, e)}>
            Save my (non-)choices
          </button>
        ) : (
          <button
            className="cookie-manage-btn"
            onClick={(e) => {
              setManage(true)
              float('Ooh, choices!', e)
            }}
          >
            Manage preferences
          </button>
        )}
        <button
          className="cookie-reject"
          style={{ transform: `translate(${rejectPos.x}px, ${rejectPos.y}px)` }}
          onMouseEnter={dodge}
          onClick={(e) => close(4, e)}
        >
          reject all
        </button>
      </div>
    </div>
  )
}
