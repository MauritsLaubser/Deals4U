import { useEffect, useRef, useState } from 'react'
import { useGame } from '../GameProvider'
import { isFixed } from '../state'
import { useRecurring } from '../useRecurring'

// Triggers when your mouse heads for the tab bar, and every now and then
// anyway for good measure (touch screens have no mouse to track).
export function ExitIntent() {
  const { state, dismiss } = useGame()
  const active = !isFixed(state, 'leave')
  const [visible, hide, show] = useRecurring(active, 60, 90)
  const [stage, setStage] = useState<'ask' | 'denied'>('ask')
  const lastShown = useRef(0)

  useEffect(() => {
    if (!active) return
    const onLeave = (event: MouseEvent) => {
      if (event.relatedTarget || event.clientY > 10) return
      if (Date.now() - lastShown.current < 20000) return
      lastShown.current = Date.now()
      show()
    }
    document.addEventListener('mouseout', onLeave)
    return () => document.removeEventListener('mouseout', onLeave)
  }, [active, show])

  if (!visible) return null

  const close = (event: React.MouseEvent) => {
    dismiss(8, event)
    setStage('ask')
    lastShown.current = Date.now()
    hide()
  }

  return (
    <div className="modal-backdrop">
      <div className="modal exit-intent" role="dialog" aria-label="Don't leave">
        {stage === 'ask' ? (
          <>
            <div className="newsletter-emoji">🥺</div>
            <h2>WAIT!!! DON'T GO!!!</h2>
            <p>
              Before you leave, here's an exclusive <strong>5% OFF</strong>{' '}
              coupon for nothing in particular!
            </p>
            <button className="big-yes" onClick={close}>
              Okay, I'll stay 😊
            </button>
            <button className="link-button" onClick={() => setStage('denied')}>
              Leave anyway
            </button>
          </>
        ) : (
          <>
            <div className="newsletter-emoji">🔒</div>
            <h2>You can't leave.</h2>
            <p>
              You still haven't played the free game at the bottom of the page!
            </p>
            <button className="big-yes" onClick={close}>
              Fine.
            </button>
          </>
        )}
      </div>
    </div>
  )
}
