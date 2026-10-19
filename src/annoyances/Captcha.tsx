import { useEffect, useState } from 'react'
import { useGame } from '../GameProvider'
import { isFixed } from '../state'
import { pick, useRecurring } from '../useRecurring'

const TARGETS = [
  { emoji: '🚦', name: 'traffic lights' },
  { emoji: '🚲', name: 'bicycles' },
  { emoji: '🚌', name: 'buses' },
  { emoji: '🔥', name: 'fire hydrants (close enough)' },
  { emoji: '🦆', name: 'ducks (for some reason)' },
]
const FILLER = ['🌳', '🏠', '🚗', '🐈', '⛰️', '🏢', '🌭', '🛒', '🚧']

type Puzzle = { target: (typeof TARGETS)[number]; tiles: string[] }

function makePuzzle(): Puzzle {
  const target = pick(TARGETS)
  const count = 2 + Math.floor(Math.random() * 3)
  const tiles = Array.from({ length: 9 }, (_, i) =>
    i < count ? target.emoji : pick(FILLER),
  ).sort(() => Math.random() - 0.5)
  return { target, tiles }
}

export function Captcha() {
  const { state, dismiss } = useGame()
  const [visible, hide] = useRecurring(!isFixed(state, 'captcha'), 45, 70, 50)
  const [checked, setChecked] = useState(false)
  const [puzzle, setPuzzle] = useState(makePuzzle)
  const [selected, setSelected] = useState<number[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!visible) return
    setChecked(false)
    setPuzzle(makePuzzle())
    setSelected([])
    setError('')
  }, [visible])

  if (!visible) return null

  const toggle = (index: number) =>
    setSelected((list) =>
      list.includes(index) ? list.filter((i) => i !== index) : [...list, index],
    )

  const verify = (event: React.MouseEvent) => {
    const correct = puzzle.tiles
      .map((tile, i) => (tile === puzzle.target.emoji ? i : -1))
      .filter((i) => i >= 0)
    const ok =
      correct.length === selected.length &&
      correct.every((i) => selected.includes(i))
    if (ok) {
      dismiss(12, event)
      hide()
      return
    }
    setError(
      pick(['Please try again.', 'Are you a robot? 🤖', 'Hmm. Suspicious.']),
    )
    setPuzzle(makePuzzle())
    setSelected([])
  }

  return (
    <div className="modal-backdrop">
      <div
        className="modal captcha"
        role="dialog"
        aria-label="Verify you are human"
      >
        {!checked ? (
          <>
            <h2>Hold on! Are you human?</h2>
            <p>We detected suspiciously human-like behaviour.</p>
            <label className="captcha-check">
              <input type="checkbox" onChange={() => setChecked(true)} />
              I'm not a robot
              <span className="captcha-logo">♻️ reCRAPTCHA</span>
            </label>
          </>
        ) : (
          <>
            <div className="captcha-head">
              Select all squares with
              <strong>{puzzle.target.name}</strong>
            </div>
            <div className="captcha-grid">
              {puzzle.tiles.map((tile, i) => (
                <button
                  key={i}
                  className={selected.includes(i) ? 'selected' : ''}
                  onClick={() => toggle(i)}
                >
                  {tile}
                </button>
              ))}
            </div>
            {error && <div className="captcha-error">{error}</div>}
            <button className="captcha-verify" onClick={verify}>
              VERIFY
            </button>
          </>
        )}
      </div>
    </div>
  )
}
