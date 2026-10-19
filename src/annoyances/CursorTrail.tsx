import { useEffect, useRef } from 'react'
import { useGame } from '../GameProvider'
import { isFixed } from '../state'

const SPARKLES = ['✨', '⭐', '💖', '🌟', '💫']
const TRAIL_LENGTH = 14

// A glittery trail that follows the mouse. Drawn straight to the DOM so it
// doesn't re-render React on every mouse move.
export function CursorTrail() {
  const { state } = useGame()
  const active = !isFixed(state, 'cursor')
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    if (!active || !layer) return
    let last = 0
    const onMove = (event: PointerEvent) => {
      const now = performance.now()
      if (now - last < 35) return
      last = now
      const sparkle = document.createElement('span')
      sparkle.className = 'sparkle'
      sparkle.textContent =
        SPARKLES[Math.floor(Math.random() * SPARKLES.length)]
      sparkle.style.left = `${event.clientX}px`
      sparkle.style.top = `${event.clientY}px`
      layer.appendChild(sparkle)
      while (layer.childElementCount > TRAIL_LENGTH) layer.firstChild?.remove()
      setTimeout(() => sparkle.remove(), 800)
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      layer.replaceChildren()
    }
  }, [active])

  if (!active) return null
  return <div ref={layerRef} className="sparkle-layer" aria-hidden />
}
