'use client'

import { submitReview } from '@/app/actions'
import { getDeviceId, validatePhone } from '@/lib/utils'
import { useState } from 'react'
import { StarRating } from './StarRating'

interface ReviewDialogProps {
    teacherId: string
    teacherName: string
    isOpen: boolean
    onClose: () => void
}

export function ReviewDialog({ teacherId, teacherName, isOpen, onClose }: ReviewDialogProps) {
    const [formData, setFormData] = useState({
        userName: '',
        userPhone: '',
        rating: 0,
        comment: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!formData.userName.trim()) {
            setError('تکایە ناوت بنووسە')
            return
        }

        if (!validatePhone(formData.userPhone)) {
            setError('ژمارەی مۆبایل نادروستە. دەبێ بە 07 دەست پێبکات')
            return
        }

        if (formData.rating === 0) {
            setError('تکایە هەڵسەنگاندنێک هەڵبژێرە')
            return
        }

        if (formData.comment.length < 10) {
            setError('بۆچوونەکە دەبێ لانیکەم 10 پیت بێت')
            return
        }

        setIsSubmitting(true)

        try {
            const deviceId = await getDeviceId()
            const result = await submitReview({
                teacherId,
                userName: formData.userName,
                userPhone: formData.userPhone,
                deviceId,
                rating: formData.rating,
                comment: formData.comment,
            })

            if (result.success) {
                alert('سوپاس! هەڵسەنگاندنەکەت تۆمارکرا')
                setFormData({ userName: '', userPhone: '', rating: 0, comment: '' })
                onClose()
                window.location.reload() // Refresh to show new review
            } else {
                setError(result.error || 'هەڵەیەک ڕوویدا')
            }
        } catch (err) {
            setError('هەڵەیەک ڕوویدا. تکایە دووبارە هەوڵبدەرەوە')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        هەڵسەنگاندن بنووسە
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    بۆ: {teacherName}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            ناوت
                        </label>
                        <input
                            type="text"
                            value={formData.userName}
                            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                            placeholder="ناوی تەواو"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            ژمارەی مۆبایل
                        </label>
                        <input
                            type="tel"
                            value={formData.userPhone}
                            onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                            placeholder="07XXXXXXXXX"
                            dir="ltr"
                        />
                    </div>

                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            هەڵسەنگاندن
                        </label>
                        <div className="flex justify-center">
                            <StarRating
                                value={formData.rating}
                                onChange={(value) => setFormData({ ...formData, rating: value })}
                                size="lg"
                            />
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            بۆچوونەکەت
                        </label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none resize-none"
                            rows={4}
                            placeholder="بیرۆکەکانت لەسەر ئەم مامۆستایە بنووسە..."
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formData.comment.length}/500
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            پاشگەزبوونەوە
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'چاوەڕوان بە...' : 'ناردن'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
