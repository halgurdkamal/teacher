import { TeacherCard } from '@/components/TeacherCard'
import { supabase } from '@/lib/supabase'

export default async function Home() {
  // Debug: Log environment check (server-side only)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  console.log('Server Supabase URL configured:', !!supabaseUrl, supabaseUrl?.includes('placeholder') ? '(Placeholder detected)' : '(Valid format)')

  // Fetch top-rated teachers
  const { data: topTeachers, error: topError } = await supabase
    .from('teachers')
    .select('*, school:schools(name)')
    .order('avg_rating', { ascending: false })
    .order('total_reviews', { ascending: false })
    .limit(6)

  if (topError) {
    console.error('Error fetching top teachers:', topError)
  }

  // Fetch recently added teachers
  const { data: recentTeachers, error: recentError } = await supabase
    .from('teachers')
    .select('*, school:schools(name)')
    .order('created_at', { ascending: false })
    .limit(6)

  if (recentError) {
    console.error('Error fetching recent teachers:', recentError)
  }

  // Check for configuration errors
  const isConfigError = !supabaseUrl || supabaseUrl.includes('placeholder')
  const configErrorMsg = isConfigError
    ? 'Supabase URL is not configured (or is using placeholder). Check your .env.local file.'
    : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Error Banners */}
      {(isConfigError || topError || recentError) && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 m-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm leading-5 font-medium text-red-800 dark:text-red-200">
                هەڵەیەک ڕوویدا
              </h3>
              <div className="mt-2 text-sm leading-5 text-red-700 dark:text-red-300">
                <ul className="list-disc pl-5 rtl:pr-5 rtl:pl-0 space-y-1">
                  {isConfigError && <li>{configErrorMsg}</li>}
                  {topError && <li>هەڵە لە هێنانی باشترینەکان: {topError.message} (Code: {topError.code})</li>}
                  {recentError && <li>هەڵە لە هێنانی نوێیەکان: {recentError.message} (Code: {recentError.code})</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

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
