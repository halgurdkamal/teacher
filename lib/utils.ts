import FingerprintJS from '@fingerprintjs/fingerprintjs'

let fpPromise: Promise<any> | null = null

// Development mode: Use simple device ID instead of FingerprintJS
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Get unique device ID using FingerprintJS (or simple random ID in dev mode)
 * Cached to avoid multiple initializations
 * 
 * DEV MODE: Uses a random ID stored in sessionStorage for easier testing
 * PROD MODE: Uses FingerprintJS for real device fingerprinting
 */
export async function getDeviceId(): Promise<string> {
    // Development mode: Use simple session-based ID
    if (isDevelopment) {
        if (typeof window === 'undefined') {
            // Server-side: return a random ID
            return `dev-${Math.random().toString(36).substring(7)}`
        }

        // Client-side: Use sessionStorage for consistent ID during session
        let devId = sessionStorage.getItem('dev_device_id')
        if (!devId) {
            devId = `dev-${Math.random().toString(36).substring(7)}-${Date.now()}`
            sessionStorage.setItem('dev_device_id', devId)
        }
        return devId
    }

    // Production mode: Use FingerprintJS
    if (!fpPromise) {
        fpPromise = FingerprintJS.load()
    }

    const fp = await fpPromise
    const result = await fp.get()
    return result.visitorId
}

/**
 * Validate Iraqi phone number format
 * Must start with 07 and have 11 digits total
 */
export function validatePhone(phone: string): boolean {
    const PHONE_REGEX = /^07[0-9]{9}$/
    return PHONE_REGEX.test(phone)
}

/**
 * Format phone number for display
 * Example: 07501234567 -> 0750 123 4567
 */
export function formatPhone(phone: string): string {
    if (phone.length !== 11) return phone
    return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`
}

/**
 * Generate initials from name for avatar
 * Example: "ئەحمەد محەمەد" -> "ئم"
 */
export function getInitials(name: string): string {
    const words = name.trim().split(/\s+/)
    if (words.length === 1) return words[0].charAt(0).toUpperCase()
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

/**
 * Generate consistent color from string (for avatars)
 */
export function getColorFromString(str: string): string {
    const colors = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308',
        '#84cc16', '#22c55e', '#10b981', '#14b8a6',
        '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
        '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
    ]

    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }

    return colors[Math.abs(hash) % colors.length]
}

/**
 * Format relative time in Kurdish
 */
export function getRelativeTime(date: string | Date): string {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'ئەمڕۆ'
    if (diffDays === 1) return 'دوێنێ'
    if (diffDays < 7) return `${diffDays} ڕۆژ لەمەوبەر`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} هەفتە لەمەوبەر`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} مانگ لەمەوبەر`
    return `${Math.floor(diffDays / 365)} ساڵ لەمەوبەر`
}

/**
 * Calculate moderation score for admin dashboard
 * Higher score = needs more attention
 */
export function getModerationScore(
    reportCount: number,
    helpfulCount: number,
    createdAt: string
): number {
    const daysSinceCreation = Math.floor(
        (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    const agePenalty = daysSinceCreation > 30 ? 5 : 0
    return (reportCount * 10) - (helpfulCount * 2) + agePenalty
}
