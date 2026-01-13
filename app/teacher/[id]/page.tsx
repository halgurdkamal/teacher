import { TeacherProfileClient } from '@/components/TeacherProfileClient'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function TeacherPage({ params }: { params: Promise<{ id: string }> }) {
    // Await params for Next.js 15 compatibility
    const { id } = await params

    // Fetch teacher data
    const { data: teacher } = await supabase
        .from('teachers')
        .select('*, school:schools(name)')
        .eq('id', id)
        .single()

    if (!teacher) {
        notFound()
    }

    // Fetch reviews
    const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('teacher_id', id)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <Link
                        href="/"
                        className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-2"
                    >
                        ← گەڕانەوە بۆ سەرەکی
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <TeacherProfileClient teacher={teacher} reviews={reviews || []} />
            </main>
        </div>
    )
}

