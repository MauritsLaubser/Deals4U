import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { formatNumber } from './format'
import {
  dismissReward,
  loadGame,
  reducer,
  saveGame,
  type Action,
  type GameState,
} from './state'

type Floater = { id: number; x: number; y: number; text: string }

type Point = { clientX: number; clientY: number }

type GameContextType = {
  state: GameState
  dispatch: (action: Action) => void
  // Close an annoyance: earn patience and show a "+N" where you clicked.
  dismiss: (weight: number, at?: Point, auto?: boolean) => void
  float: (text: string, at?: Point) => void
}

const GameContext = createContext({} as GameContextType)

export const useGame = () => useContext(GameContext)

let floaterId = 0

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadGame)
  const [floaters, setFloaters] = useState<Floater[]>([])
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    let last = performance.now()
    const timer = setInterval(() => {
      const now = performance.now()
      dispatch({ type: 'tick', dt: (now - last) / 1000 })
      last = now
    }, 100)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const save = () => saveGame(stateRef.current)
    const timer = setInterval(save, 5000)
    window.addEventListener('beforeunload', save)
    return () => {
      clearInterval(timer)
      window.removeEventListener('beforeunload', save)
    }
  }, [])

  const float = useCallback((text: string, at?: Point) => {
    const id = ++floaterId
    const x = at?.clientX ?? window.innerWidth / 2
    const y = at?.clientY ?? window.innerHeight / 2
    setFloaters((list) => [...list.slice(-30), { id, x, y, text }])
    setTimeout(
      () => setFloaters((list) => list.filter((f) => f.id !== id)),
      1100,
    )
  }, [])

  const dismiss = useCallback(
    (weight: number, at?: Point, auto?: boolean) => {
      const reward = dismissReward(stateRef.current, weight, auto)
      dispatch({ type: 'dismiss', weight, auto })
      float(`+${formatNumber(reward)} 🧘`, at)
    },
    [float],
  )

  return (
    <GameContext.Provider value={{ state, dispatch, dismiss, float }}>
      {children}
      <div className="floaters" aria-hidden>
        {floaters.map((f) => (
          <span key={f.id} className="floater" style={{ left: f.x, top: f.y }}>
            {f.text}
          </span>
        ))}
      </div>
    </GameContext.Provider>
  )
}
