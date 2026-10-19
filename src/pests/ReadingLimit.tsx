import { useGame } from '../GameProvider'
import { isFixed } from '../state'
import { useRecurring } from '../useRecurring'

export function Paywall() {
  const { state, dismiss, float } = useGame()
  const [visible, hide] = useRecurring(!isFixed(state, 'paywall'), 50, 70, 40)

  if (!visible) return null

  return (
    <div className="limit-sheet" role="dialog" aria-label="Paywall">
      <div className="limit-card">
        <h2>You've read 3 of 3 free articles this month.</h2>
        <p>
          (This is your first visit. The math checks out, trust us.) Subscribe
          to DEALS4U PREMIUM for unlimited scrolling!
        </p>
        <div className="limit-actions">
          <button
            className="limit-subscribe"
            onClick={(e) => float('Card declined. Thank goodness.', e)}
          >
            Subscribe · $49.99/week
          </button>
          <button
            className="link-button"
            onClick={(e) => {
              dismiss(8, e)
              hide()
            }}
          >
            Continue reading with 400% more ads
          </button>
        </div>
      </div>
    </div>
  )
}
