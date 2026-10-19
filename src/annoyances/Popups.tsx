import { useCallback, useEffect, useRef, useState } from 'react'
import { internInterval } from '../data'
import { useGame } from '../GameProvider'
import { isFixed } from '../state'
import { pick } from '../useRecurring'

const ADS = [
  {
    title: '🎉 CONGRATULATIONS!!!',
    body: 'You are the 1,000,000th visitor! Click to claim your FREE iPod Nano (2006).',
    color: '#ffeb3b',
  },
  {
    title: '💻 PC Doctor',
    body: 'Your PC is running SLOW! 847 viruses detected. Download More RAM now!',
    color: '#80deea',
  },
  {
    title: '💘 Lonely?',
    body: 'Hot singles in your area are ALSO trying to close this popup.',
    color: '#f8bbd0',
  },
  {
    title: '🧙 One weird trick',
    body: 'Local dad discovers one weird trick to close popups. Websites HATE him!',
    color: '#c5e1a5',
  },
  {
    title: '💰 Crypto',
    body: 'Invest in $POPUP coin. Guaranteed returns of ∞%. Not financial advice. Is advice.',
    color: '#ffcc80',
  },
  {
    title: '⚠️ WARNING',
    body: 'Your browser is out of date! (It is not.) Click here to update to Browser 2.',
    color: '#ef9a9a',
  },
  {
    title: '🦷 Dentists hate this',
    body: 'Whiten your teeth with this one popup. Close it to find out how!',
    color: '#b39ddb',
  },
  {
    title: '🎰 SPIN THE WHEEL',
    body: 'Every spin is a winner! Prizes include: another popup.',
    color: '#a5d6a7',
  },
  {
    title: '🏝️ You won a cruise',
    body: 'Just pay $9.99 shipping and handling for the ocean.',
    color: '#90caf9',
  },
  {
    title: '📞 Free Ringtones',
    body: 'Text CRAZYFROG to 55555. Charges of $12/week may apply forever.',
    color: '#fff59d',
  },
] as const

type Popup = {
  id: number
  x: number
  y: number
  ad: (typeof ADS)[number]
  // Some popups have a big fake ✕ that just spawns more popups.
  fakeX: boolean
}

const MAX_POPUPS = 6
const POPUP_WIDTH = 280
export const SPAWN_POPUP_EVENT = 'deals4u:popup'

let popupId = 0

export function spawnPopupAd() {
  window.dispatchEvent(new Event(SPAWN_POPUP_EVENT))
}

function makePopup(): Popup {
  // Leave room for the repair shop sidebar on wide screens.
  const usable =
    window.innerWidth > 900 ? window.innerWidth - 360 : window.innerWidth
  return {
    id: ++popupId,
    x: Math.max(8, Math.random() * (usable - POPUP_WIDTH - 8)),
    y: 70 + Math.random() * Math.max(40, window.innerHeight - 300),
    ad: pick(ADS),
    fakeX: Math.random() < 0.25,
  }
}

export function Popups() {
  const { state, dismiss, float } = useGame()
  const active = !isFixed(state, 'popups')
  const intern = state.levels.intern
  const [popups, setPopups] = useState<Popup[]>([])
  const popupsRef = useRef(popups)
  popupsRef.current = popups

  const spawn = useCallback((count = 1) => {
    setPopups((list) => {
      const added = Array.from({ length: count }, makePopup)
      return [...list, ...added].slice(-MAX_POPUPS)
    })
  }, [])

  useEffect(() => {
    if (!active) {
      setPopups([])
      return
    }
    let timer: ReturnType<typeof setTimeout>
    const loop = () => {
      timer = setTimeout(
        () => {
          if (popupsRef.current.length < MAX_POPUPS) spawn()
          loop()
        },
        2500 + Math.random() * 2000,
      )
    }
    loop()
    const onEvent = () => {
      if (popupsRef.current.length < MAX_POPUPS) spawn()
    }
    window.addEventListener(SPAWN_POPUP_EVENT, onEvent)
    return () => {
      clearTimeout(timer)
      window.removeEventListener(SPAWN_POPUP_EVENT, onEvent)
    }
  }, [active, spawn])

  // The intern closes the oldest popup every few seconds.
  useEffect(() => {
    if (!active || intern === 0) return
    const timer = setInterval(
      () => {
        const oldest = popupsRef.current[0]
        if (!oldest) return
        setPopups((list) => list.filter((p) => p.id !== oldest.id))
        dismiss(
          1,
          { clientX: oldest.x + POPUP_WIDTH / 2, clientY: oldest.y + 20 },
          true,
        )
      },
      internInterval(intern) * 1000,
    )
    return () => clearInterval(timer)
  }, [active, intern, dismiss])

  if (!active) return null

  const close = (popup: Popup, event: React.MouseEvent) => {
    setPopups((list) => list.filter((p) => p.id !== popup.id))
    dismiss(1, event)
  }

  const fakeClose = (popup: Popup, event: React.MouseEvent) => {
    float('That was an ad 😈', event)
    setPopups((list) => list.filter((p) => p.id !== popup.id))
    spawn(2)
  }

  return (
    <>
      {popups.map((popup) => (
        <div
          key={popup.id}
          className="popup"
          style={{ left: popup.x, top: popup.y, width: POPUP_WIDTH }}
          role="dialog"
          aria-label={popup.ad.title}
        >
          <div className="popup-titlebar">
            <span>{popup.ad.title}</span>
            <button
              className="popup-x"
              aria-label="Close"
              onClick={(e) => close(popup, e)}
            >
              ✕
            </button>
          </div>
          <div className="popup-body" style={{ background: popup.ad.color }}>
            {popup.fakeX && (
              <button
                className="popup-fake-x"
                onClick={(e) => fakeClose(popup, e)}
              >
                ✕ CLOSE
              </button>
            )}
            <p>{popup.ad.body}</p>
            <button className="popup-cta" onClick={(e) => fakeClose(popup, e)}>
              CLICK HERE ▶
            </button>
          </div>
        </div>
      ))}
    </>
  )
}
