import { useEffect, useState } from 'react'
import { useGame } from '../GameProvider'
import { isFixed } from '../state'
import { pick, useRecurring } from '../useRecurring'

const DECLINES = [
  'No thanks, I hate saving money',
  'No, I prefer paying full price like a fool',
  "No, I don't like fun or deals",
  'No, my inbox is already too empty',
  'I am above discounts',
]

export function Newsletter() {
  const { state, dismiss } = useGame()
  const [visible, hide] = useRecurring(
    !isFixed(state, 'newsletter'),
    35,
    55,
    12,
  )
  const [canClose, setCanClose] = useState(false)
  const [decline, setDecline] = useState(DECLINES[0])
  const [email, setEmail] = useState('')

  // The close button only shows up after a while. Classic.
  useEffect(() => {
    if (!visible) return
    setCanClose(false)
    setDecline(pick(DECLINES))
    const timer = setTimeout(() => setCanClose(true), 3000)
    return () => clearTimeout(timer)
  }, [visible])

  if (!visible) return null

  const close = (weight: number, event: React.MouseEvent) => {
    dismiss(weight, event)
    setEmail('')
    hide()
  }

  return (
    <div className="modal-backdrop">
      <div className="modal newsletter" role="dialog" aria-label="Newsletter">
        {canClose && (
          <button
            className="modal-x"
            aria-label="Close"
            onClick={(e) => close(5, e)}
          >
            ✕
          </button>
        )}
        <div className="newsletter-emoji">📬</div>
        <h2>WAIT! Before you see anything!</h2>
        <p>
          Join <strong>2,000,000</strong> deal hunters and get our newsletter
          only <strong>14 times a day</strong>!
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" onClick={(e) => close(6, e)}>
            SUBSCRIBE!!!
          </button>
        </form>
        <button className="link-button" onClick={(e) => close(5, e)}>
          {decline}
        </button>
      </div>
    </div>
  )
}
