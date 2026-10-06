export function formatPlayTime(seconds) {
    if (!seconds || seconds <= 0)
        return '0 hrs';
    if (seconds < 60)
        return `${seconds}s`;
    if (seconds < 3600) {
        const mins = Math.round(seconds / 60);
        return `${mins} min${mins === 1 ? '' : 's'}`;
    }
    const hours = (seconds / 3600).toFixed(1);
    return `${hours} hrs`;
}
export function formatLastPlayed(timestamp) {
    if (!timestamp)
        return 'Never';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (minutes < 1)
        return 'Just now';
    if (minutes < 60)
        return `${minutes}m ago`;
    if (hours < 24)
        return `${hours}h ago`;
    if (days === 1)
        return 'Yesterday';
    if (days < 30)
        return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
