'use client'

import { Avatar } from '@/components/Avatar'
import { ReviewCard } from '@/components/ReviewCard'
import { ReviewDialog } from '@/components/ReviewDialog'
import { StarRating } from '@/components/StarRating'
import type { Review, Teacher } from '@/lib/supabase'
import { useState } from 'react'

interface TeacherProfileClientProps {
    teacher: Teacher & { school?: { name: string } }
    reviews: Review[]
}

export function TeacherProfileClient({ teacher, reviews }: TeacherProfileClientProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    return (
        <>
            {/* Teacher Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
                <div className="flex items-center gap-6 mb-6">
                    <Avatar name={teacher.name} imageUrl={teacher.image_url} size="lg" />
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {teacher.name}
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">
                            {teacher.subject}
                        </p>
                        {teacher.school && (
                            <p className="text-gray-500 dark:text-gray-400">
                                🏫 {teacher.school.name}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex items-center gap-4">
                        <StarRating value={teacher.avg_rating} readonly size="lg" />
                        <div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {teacher.avg_rating.toFixed(1)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {teacher.total_reviews} هەڵسەنگاندن
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                    >
                        هەڵسەنگاندن بنووسە
                    </button>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    هەڵسەنگاندنەکان
                </h2>

                {reviews.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            هێشتا هیچ هەڵسەنگاندنێک نییە
                        </p>
                        <p className="text-gray-400 dark:text-gray-500">
                            یەکەم کەس بە بۆ هەڵسەنگاندنی ئەم مامۆستایە
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                )}
            </div>

            {/* Review Dialog */}
            <ReviewDialog
                teacherId={teacher.id}
                teacherName={teacher.name}
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />
        </>
    )
}
