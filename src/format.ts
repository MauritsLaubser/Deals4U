const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc']

export function formatNumber(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '∞'
  if (Math.abs(value) < 1000) {
    return Number.isInteger(value) || decimals === 0
      ? Math.floor(value).toString()
      : value.toFixed(decimals)
  }
  const tier = Math.min(
    Math.floor(Math.log10(Math.abs(value)) / 3),
    SUFFIXES.length - 1,
  )
  const scaled = value / 1000 ** tier
  return `${scaled.toFixed(scaled < 100 ? 2 : 1)}${SUFFIXES[tier]}`
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
}
