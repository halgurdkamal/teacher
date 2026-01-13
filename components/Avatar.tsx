import { getColorFromString, getInitials } from '@/lib/utils'

interface AvatarProps {
    name: string
    imageUrl?: string | null
    size?: 'sm' | 'md' | 'lg'
}

export function Avatar({ name, imageUrl, size = 'md' }: AvatarProps) {
    const sizeClasses = {
        sm: 'w-10 h-10 text-sm',
        md: 'w-16 h-16 text-xl',
        lg: 'w-24 h-24 text-3xl',
    }

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={name}
                className={`${sizeClasses[size]} rounded-full object-cover`}
            />
        )
    }

    const initials = getInitials(name)
    const bgColor = getColorFromString(name)

    return (
        <div
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white`}
            style={{ backgroundColor: bgColor }}
        >
            {initials}
        </div>
    )
}
