import type { Teacher } from '@/lib/supabase'
import Link from 'next/link'
import { Avatar } from './Avatar'
import { StarRating } from './StarRating'

interface TeacherCardProps {
    teacher: Teacher & { school?: { name: string } }
}

export function TeacherCard({ teacher }: TeacherCardProps) {
    return (
        <Link href={`/teacher/${teacher.id}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                    <Avatar name={teacher.name} imageUrl={teacher.image_url} size="md" />
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {teacher.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {teacher.subject}
                        </p>
                    </div>
                </div>

                {teacher.school && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        🏫 {teacher.school.name}
                    </p>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <StarRating value={teacher.avg_rating} readonly size="sm" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {teacher.avg_rating.toFixed(1)}
                        </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {teacher.total_reviews} هەڵسەنگاندن
                    </span>
                </div>
            </div>
        </Link>
    )
}
