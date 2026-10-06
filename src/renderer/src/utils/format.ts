export function formatPlayTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 hrs'
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) {
    const mins = Math.round(seconds / 60)
    return `${mins} min${mins === 1 ? '' : 's'}`
  }
  const hours = (seconds / 3600).toFixed(1)
  return `${hours} hrs`
}

export function formatLastPlayed(timestamp: number | null): string {
  if (!timestamp) return 'Never'
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Normalizes a local cover file path or remote image URL into a displayable browser src.
 * Converts local paths into privileged custom protocol URLs (x1-media://).
 */
export function getCoverDisplayUrl(coverPath?: string, coverUrl?: string): string | undefined {
  const target = coverPath || coverUrl
  if (!target) return undefined
  if (
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    target.startsWith('data:')
  ) {
    return target
  }
  if (target.startsWith('x1-media://')) {
    return target
  }

  // Convert Windows/POSIX file path to x1-media:// protocol URL using query parameter
  // This prevents Chromium from stripping drive colons in Windows paths (e.g. C:)
  return `x1-media://artwork/?path=${encodeURIComponent(target)}`
}

