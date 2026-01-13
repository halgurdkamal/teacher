'use client'

import { supabase } from '@/lib/supabase'
import { getModerationScore, getRelativeTime } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { addFakeReview, deleteReview, deleteTeacher, toggleReviewVisibility, updateTeacher } from './actions'

type Teacher = any
type Review = any

export default function AdminDashboard({
    teachers,
    reviews,
    reportedReviews,
}: {
    teachers: Teacher[]
    reviews: Review[]
    reportedReviews: Review[]
}) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'teachers' | 'reviews' | 'reported'>('teachers')
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    // Edit Teacher Modal
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
    const [editForm, setEditForm] = useState({ name: '', subject: '', schoolId: '' })
    const [schools, setSchools] = useState<any[]>([])

    // Add Review Modal
    const [addingReviewFor, setAddingReviewFor] = useState<Teacher | null>(null)
    const [reviewForm, setReviewForm] = useState({
        userName: '',
        userPhone: '',
        rating: 5,
        comment: ''
    })

    // Delete Confirmation Modal
    const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null)
    const [deletingReview, setDeletingReview] = useState<Review | null>(null)

    // Load schools when component mounts
    useState(() => {
        const loadSchools = async () => {
            const { data } = await supabase.from('schools').select('*').order('name')
            if (data) setSchools(data)
        }
        loadSchools()
    })

    const handleDeleteTeacher = async () => {
        if (!deletingTeacher) return

        setIsDeleting(deletingTeacher.id)
        const result = await deleteTeacher(deletingTeacher.id)
        setIsDeleting(null)
        setDeletingTeacher(null)

        if (result.success) {
            router.refresh()
        } else {
            alert(result.error)
        }
    }

    const handleDeleteReview = async () => {
        if (!deletingReview) return

        setIsDeleting(deletingReview.id)
        const result = await deleteReview(deletingReview.id)
        setIsDeleting(null)
        setDeletingReview(null)

        if (result.success) {
            router.refresh()
        } else {
            alert(result.error)
        }
    }

    const handleToggleVisibility = async (reviewId: string, isHidden: boolean) => {
        setIsDeleting(reviewId)
        const result = await toggleReviewVisibility(reviewId, isHidden)
        setIsDeleting(null)

        if (result.success) {
            router.refresh()
        } else {
            alert(result.error)
        }
    }

    const openEditTeacher = (teacher: Teacher) => {
        setEditingTeacher(teacher)
        setEditForm({
            name: teacher.name,
            subject: teacher.subject,
            schoolId: teacher.school_id || ''
        })
    }

    const handleUpdateTeacher = async () => {
        if (!editingTeacher) return

        const result = await updateTeacher(editingTeacher.id, editForm)
        if (result.success) {
            setEditingTeacher(null)
            router.refresh()
        } else {
            alert(result.error)
        }
    }

    const openAddReview = (teacher: Teacher) => {
        setAddingReviewFor(teacher)
        setReviewForm({
            userName: '',
            userPhone: '',
            rating: 5,
            comment: ''
        })
    }

    const handleAddReview = async () => {
        if (!addingReviewFor) return

        const result = await addFakeReview({
            teacherId: addingReviewFor.id,
            ...reviewForm
        })

        if (result.success) {
            setAddingReviewFor(null)
            router.refresh()
        } else {
            alert(result.error)
        }
    }

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">کۆی مامۆستایان</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{teachers.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">کۆی هەڵسەنگاندنەکان</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{reviews.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">گوزارشتکراوەکان</h3>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{reportedReviews.length}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('teachers')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'teachers'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            مامۆستایان ({teachers.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reviews'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            هەموو هەڵسەنگاندنەکان ({reviews.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('reported')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reported'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            گوزارشتکراوەکان ({reportedReviews.length})
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {/* Teachers Tab */}
                    {activeTab === 'teachers' && (
                        <div className="space-y-4">
                            {teachers.map((teacher) => (
                                <div
                                    key={teacher.id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {teacher.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {teacher.subject} • {teacher.school?.name || 'بێ قوتابخانە'}
                                            </p>
                                            <div className="flex gap-4 mt-2 text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    ⭐ {teacher.avg_rating.toFixed(1)}
                                                </span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    📝 {teacher.total_reviews} هەڵسەنگاندن
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <a
                                                href={`/teacher/${teacher.id}`}
                                                className="text-blue-600 dark:text-blue-400 hover:underline text-sm px-3 py-1"
                                            >
                                                بینین
                                            </a>
                                            <button
                                                onClick={() => openEditTeacher(teacher)}
                                                className="text-green-600 dark:text-green-400 hover:underline text-sm px-3 py-1"
                                            >
                                                دەستکاری
                                            </button>
                                            <button
                                                onClick={() => openAddReview(teacher)}
                                                className="text-purple-600 dark:text-purple-400 hover:underline text-sm px-3 py-1"
                                            >
                                                + هەڵسەنگاندن
                                            </button>
                                            <button
                                                onClick={() => setDeletingTeacher(teacher)}
                                                disabled={isDeleting === teacher.id}
                                                className="text-red-600 dark:text-red-400 hover:underline text-sm px-3 py-1 disabled:opacity-50"
                                            >
                                                {isDeleting === teacher.id ? '...' : 'سڕینەوە'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {teachers.length === 0 && (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                                    هیچ مامۆستایەک نییە
                                </p>
                            )}
                        </div>
                    )}

                    {/* All Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div
                                    key={review.id}
                                    className={`border rounded-lg p-4 ${review.is_hidden
                                        ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {review.user_name}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {review.teacher?.name} • {review.teacher?.subject}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                                            {review.is_hidden && (
                                                <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                                                    شاراوە
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                                        {review.comment}
                                    </p>
                                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex gap-4">
                                            <span>📞 {review.user_phone}</span>
                                            <span>👍 {review.helpful_count}</span>
                                            <span className="text-red-600 dark:text-red-400">🚩 {review.report_count}</span>
                                            <span>{getRelativeTime(review.created_at)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleToggleVisibility(review.id, review.is_hidden)}
                                                disabled={isDeleting === review.id}
                                                className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                                            >
                                                {review.is_hidden ? 'پیشاندان' : 'شاردنەوە'}
                                            </button>
                                            <button
                                                onClick={() => setDeletingReview(review)}
                                                disabled={isDeleting === review.id}
                                                className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                                            >
                                                سڕینەوە
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {reviews.length === 0 && (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                                    هیچ هەڵسەنگاندنێک نییە
                                </p>
                            )}
                        </div>
                    )}

                    {/* Reported Reviews Tab */}
                    {activeTab === 'reported' && (
                        <div className="space-y-4">
                            {reportedReviews
                                .sort((a, b) => getModerationScore(b.report_count, b.helpful_count, b.created_at) - getModerationScore(a.report_count, a.helpful_count, a.created_at))
                                .map((review) => (
                                    <div
                                        key={review.id}
                                        className="border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg p-4"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {review.user_name}
                                                    </p>
                                                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                                                        نمرەی بەڕێوەبردن: {getModerationScore(review.report_count, review.helpful_count, review.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {review.teacher?.name} • {review.teacher?.subject}
                                                </p>
                                            </div>
                                            <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                                            {review.comment}
                                        </p>
                                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                            <div className="flex gap-4">
                                                <span>📞 {review.user_phone}</span>
                                                <span>👍 {review.helpful_count}</span>
                                                <span className="text-red-600 dark:text-red-400 font-bold">🚩 {review.report_count} گوزارشت</span>
                                                <span>{getRelativeTime(review.created_at)}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleToggleVisibility(review.id, review.is_hidden)}
                                                    disabled={isDeleting === review.id}
                                                    className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                                                >
                                                    {review.is_hidden ? 'پیشاندان' : 'شاردنەوە'}
                                                </button>
                                                <button
                                                    onClick={() => setDeletingReview(review)}
                                                    disabled={isDeleting === review.id}
                                                    className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                                                >
                                                    سڕینەوە
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            {reportedReviews.length === 0 && (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                                    هیچ هەڵسەنگاندنێکی گوزارشتکراو نییە
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Teacher Modal */}
            {editingTeacher && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            دەستکاریکردنی مامۆستا
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    ناو
                                </label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    بابەت
                                </label>
                                <input
                                    type="text"
                                    value={editForm.subject}
                                    onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    قوتابخانە
                                </label>
                                <select
                                    value={editForm.schoolId}
                                    onChange={(e) => setEditForm({ ...editForm, schoolId: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">قوتابخانەیەک هەڵبژێرە</option>
                                    {schools.map((school) => (
                                        <option key={school.id} value={school.id}>{school.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 justify-end mt-6">
                                <button
                                    onClick={() => setEditingTeacher(null)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                >
                                    پاشگەزبوونەوە
                                </button>
                                <button
                                    onClick={handleUpdateTeacher}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                >
                                    نوێکردنەوە
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Review Modal */}
            {addingReviewFor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            زیادکردنی هەڵسەنگاندن
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            بۆ: {addingReviewFor.name}
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    ناوی بەکارهێنەر
                                </label>
                                <input
                                    type="text"
                                    value={reviewForm.userName}
                                    onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="ئەحمەد محەمەد"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    ژمارەی مۆبایل
                                </label>
                                <input
                                    type="text"
                                    value={reviewForm.userPhone}
                                    onChange={(e) => setReviewForm({ ...reviewForm, userPhone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="07501234567"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    هەڵسەنگاندن
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            className="text-3xl"
                                        >
                                            {star <= reviewForm.rating ? '⭐' : '☆'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    تێبینی
                                </label>
                                <textarea
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    rows={3}
                                    placeholder="تێبینیەکەت بنووسە..."
                                />
                            </div>
                            <div className="flex gap-2 justify-end mt-6">
                                <button
                                    onClick={() => setAddingReviewFor(null)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                >
                                    پاشگەزبوونەوە
                                </button>
                                <button
                                    onClick={handleAddReview}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                >
                                    زیادکردن
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingTeacher && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                            سڕینەوەی مامۆستا
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            دڵنیای لە سڕینەوەی <strong>{deletingTeacher.name}</strong>؟
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-6">
                            ⚠️ هەموو هەڵسەنگاندنەکانیش دەسڕێنەوە و ناگەڕێتەوە!
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setDeletingTeacher(null)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                                پاشگەزبوونەوە
                            </button>
                            <button
                                onClick={handleDeleteTeacher}
                                disabled={isDeleting === deletingTeacher.id}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                            >
                                {isDeleting === deletingTeacher.id ? 'چاوەڕوان بە...' : 'سڕینەوە'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Review Confirmation Modal */}
            {deletingReview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                            سڕینەوەی هەڵسەنگاندن
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                            دڵنیای لە سڕینەوەی هەڵسەنگاندنی <strong>{deletingReview.user_name}</strong>؟
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {'⭐'.repeat(deletingReview.rating)} • {deletingReview.comment?.substring(0, 50)}...
                            </p>
                        </div>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-6">
                            ⚠️ ئەم هەڵسەنگاندنە بە تەواوی دەسڕێتەوە!
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setDeletingReview(null)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                                پاشگەزبوونەوە
                            </button>
                            <button
                                onClick={handleDeleteReview}
                                disabled={isDeleting === deletingReview.id}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                            >
                                {isDeleting === deletingReview.id ? 'چاوەڕوان بە...' : 'سڕینەوە'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
