import { useCallback, useEffect, useState } from 'react'

// Shows something after a random delay, and schedules it again every time
// it gets hidden. Stops for good once `active` turns false (i.e. it's fixed).
export function useRecurring(
  active: boolean,
  minSeconds: number,
  maxSeconds: number,
  firstDelaySeconds?: number,
) {
  const [visible, setVisible] = useState(false)
  const [round, setRound] = useState(0)

  useEffect(() => {
    if (!active || visible) return
    const seconds =
      round === 0 && firstDelaySeconds !== undefined
        ? firstDelaySeconds
        : minSeconds + Math.random() * (maxSeconds - minSeconds)
    const timer = setTimeout(() => setVisible(true), seconds * 1000)
    return () => clearTimeout(timer)
  }, [active, visible, round, minSeconds, maxSeconds, firstDelaySeconds])

  const hide = useCallback(() => {
    setVisible(false)
    setRound((r) => r + 1)
  }, [])

  const show = useCallback(() => setVisible(true), [])

  return [active && visible, hide, show] as const
}

export const pick = <T>(list: readonly T[]): T =>
  list[Math.floor(Math.random() * list.length)]
