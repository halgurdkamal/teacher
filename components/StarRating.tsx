'use client'

import { useState } from 'react'

interface StarRatingProps {
    value: number
    onChange?: (value: number) => void
    readonly?: boolean
    size?: 'sm' | 'md' | 'lg'
}

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState(0)

    const sizeClasses = {
        sm: 'text-base',
        md: 'text-2xl',
        lg: 'text-4xl',
    }

    const displayValue = hoverValue || value

    return (
        <div className={`star-rating flex gap-1 ${sizeClasses[size]}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => !readonly && setHoverValue(star)}
                    onMouseLeave={() => !readonly && setHoverValue(0)}
                    className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
                >
                    <span className={star <= displayValue ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                    </span>
                </button>
            ))}
        </div>
    )
}
