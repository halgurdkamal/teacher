'use client'

import { markReviewHelpful, reportReview } from '@/app/actions'
import type { Review } from '@/lib/supabase'
import { getDeviceId, getRelativeTime } from '@/lib/utils'
import { useState } from 'react'
import { Avatar } from './Avatar'
import { StarRating } from './StarRating'

interface ReviewCardProps {
    review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
    const [isReporting, setIsReporting] = useState(false)
    const [isMarkingHelpful, setIsMarkingHelpful] = useState(false)
    const [helpfulCount, setHelpfulCount] = useState(review.helpful_count)
    const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false)

    const handleReport = async () => {
        if (isReporting) return
        setIsReporting(true)

        const deviceId = await getDeviceId()
        const result = await reportReview(review.id, deviceId)

        if (result.success) {
            alert('گوزارشتکرا. سوپاس!')
        } else {
            alert(result.error || 'هەڵەیەک ڕوویدا')
        }
        setIsReporting(false)
    }

    const handleMarkHelpful = async () => {
        if (isMarkingHelpful || hasMarkedHelpful) return
        setIsMarkingHelpful(true)

        const deviceId = await getDeviceId()
        const result = await markReviewHelpful(review.id, deviceId)

        if (result.success) {
            setHelpfulCount(prev => prev + 1)
            setHasMarkedHelpful(true)
        } else {
            alert(result.error || 'هەڵەیەک ڕوویدا')
        }
        setIsMarkingHelpful(false)
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3 mb-3">
                <Avatar name={review.user_name} size="sm" />
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                            {review.user_name}
                        </h4>
                        <StarRating value={review.rating} readonly size="sm" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getRelativeTime(review.created_at)}
                    </p>
                </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                {review.comment}
            </p>

            <div className="flex items-center gap-4 text-sm">
                <button
                    onClick={handleMarkHelpful}
                    disabled={hasMarkedHelpful || isMarkingHelpful}
                    className={`flex items-center gap-1 ${hasMarkedHelpful
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                        } transition-colors disabled:opacity-50`}
                >
                    <span>👍</span>
                    <span>سوودمەندە ({helpfulCount})</span>
                </button>

                <button
                    onClick={handleReport}
                    disabled={isReporting}
                    className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                >
                    <span>🚩</span>
                    <span>گوزارشت</span>
                </button>
            </div>
        </div>
    )
}
