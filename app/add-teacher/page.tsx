import { requireAuth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AddTeacherForm from './AddTeacherForm'

export const runtime = 'edge'

export default async function AddTeacherPage() {
    // Check authentication
    const session = await requireAuth()

    if (!session) {
        redirect('/admin/login')
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
                    <a
                        href="/"
                        className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-2"
                    >
                        ← گەڕانەوە بۆ سەرەکی
                    </a>

                    <form onSubmit={signOut}>
                        <button

                            type="submit"
                            className="text-sm text-red-600 dark:text-red-400 hover:underline"
                        >
                            چوونەدەرەوە
                        </button>
                    </form>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        مامۆستایەکی نوێ زیاد بکە
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        چوونەژوورەوە وەک: {session.user?.email}
                    </p>

                    <AddTeacherForm />
                </div>
            </main>
        </div>
    )
}
