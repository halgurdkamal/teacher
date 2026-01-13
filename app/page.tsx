import { TeacherCard } from '@/components/TeacherCard'
import { supabase } from '@/lib/supabase'

export default async function Home() {
  // Fetch top-rated teachers
  const { data: topTeachers } = await supabase
    .from('teachers')
    .select('*, school:schools(name)')
    .order('avg_rating', { ascending: false })
    .order('total_reviews', { ascending: false })
    .limit(6)

  // Fetch recently added teachers
  const { data: recentTeachers } = await supabase
    .from('teachers')
    .select('*, school:schools(name)')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
            هەڵسەنگاندنی مامۆستایان
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Top Rated Teachers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            باشترین مامۆستایان
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topTeachers?.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
          {!topTeachers || topTeachers.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">
              هیچ مامۆستایەک نەدۆزرایەوە
            </p>
          )}
        </section>

        {/* Recently Added */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            مامۆستا تازەکان
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentTeachers?.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">
          <p>سیستەمی هەڵسەنگاندنی مامۆستایان</p>
        </div>
      </footer>
    </div>
  )
}
