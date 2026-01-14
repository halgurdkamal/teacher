import { requireAuth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminDashboard from './AdminDashboard'
import { getAllReviews, getAllTeachers, getReportedReviews } from './actions'

export const runtime = 'edge'

export default async function AdminPage() {
    // Check authentication
    const session = await requireAuth()

    if (!session) {
        redirect('/admin/login')
    }

    // Fetch all data
    const teachersResult = await getAllTeachers()
    const reviewsResult = await getAllReviews()
    const reportedResult = await getReportedReviews()

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                پانێڵی بەڕێوەبەر
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                چوونەژوورەوە وەک: {session.user?.email}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <a
                                href="/add-teacher"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                                + مامۆستا زیاد بکە
                            </a>
                            <a
                                href="/"
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2"
                            >
                                سەرەکی
                            </a>
                            <form onSubmit={signOut}>
                                <button
                                    type="submit"
                                    className="text-red-600 dark:text-red-400 hover:underline px-4 py-2"
                                >
                                    چوونەدەرەوە
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <AdminDashboard
                    teachers={teachersResult.data || []}
                    reviews={reviewsResult.data || []}
                    reportedReviews={reportedResult.data || []}
                />
            </main>
        </div>
    )
}
