import { useState } from 'react'
import { useGame } from '../GameProvider'
import { isFixed } from '../state'
import { pick, useRecurring } from '../useRecurring'

const TOASTS = [
  '🔥 FLASH SALE! Everything 0% off!',
  '📦 Your package could not be delivered (you ordered nothing)',
  '👀 Someone in Ohio just bought socks!',
  '💬 Botty misses you',
  '⏰ Reminder: You have not visited DEALS4U in 0 seconds',
  '🎁 You have 1 unclaimed reward (it is a notification)',
]

type Toast = { id: number; text: string }
let toastId = 0

export function Notifications() {
  const { state, dismiss } = useGame()
  const active = !isFixed(state, 'notifications')
  const [visible, hide] = useRecurring(active, 25, 40, 20)
  const [toasts, setToasts] = useState<Toast[]>([])

  if (!active) return null

  const allow = (event: React.MouseEvent) => {
    // Allowing notifications gives you... notifications.
    setToasts((list) => [
      ...list,
      ...Array.from({ length: 3 }, () => ({
        id: ++toastId,
        text: pick(TOASTS),
      })),
    ])
    dismiss(1, event)
    hide()
  }

  return (
    <>
      {visible && (
        <div
          className="permission-prompt"
          role="dialog"
          aria-label="Notification permission"
        >
          <div className="permission-url">🔒 deals4u.biz wants to</div>
          <div className="permission-what">🔔 Show notifications</div>
          <div className="permission-actions">
            <button onClick={allow}>Allow</button>
            <button
              onClick={(e) => {
                dismiss(2, e)
                hide()
              }}
            >
              Block
            </button>
          </div>
        </div>
      )}
      <div className="pings">
        {toasts.map((toast) => (
          <div key={toast.id} className="ping">
            <div>
              <div className="ping-from">deals4u.biz</div>
              {toast.text}
            </div>
            <button
              aria-label="Dismiss notification"
              onClick={(e) => {
                setToasts((list) => list.filter((t) => t.id !== toast.id))
                dismiss(1, e)
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
