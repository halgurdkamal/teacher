'use client'

import { addTeacher } from '@/app/actions'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AddTeacherForm() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        schoolId: '',
        newSchoolName: '',
    })
    const [schools, setSchools] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [showNewSchool, setShowNewSchool] = useState(false)

    // Load schools on mount
    useState(() => {
        const loadSchools = async () => {
            const { data } = await supabase
                .from('schools')
                .select('*')
                .order('name')
            if (data) setSchools(data)
        }
        loadSchools()
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!formData.name.trim()) {
            setError('تکایە ناوی مامۆستا بنووسە')
            return
        }

        if (!formData.subject.trim()) {
            setError('تکایە بابەت بنووسە')
            return
        }

        if (!formData.schoolId && !formData.newSchoolName.trim()) {
            setError('تکایە قوتابخانەیەک هەڵبژێرە یان نوێیەک زیاد بکە')
            return
        }

        setIsLoading(true)

        const result = await addTeacher({
            name: formData.name,
            subject: formData.subject,
            schoolId: formData.schoolId || undefined,
            newSchoolName: formData.newSchoolName || undefined,
        })

        if (result.success && result.teacherId) {
            router.push(`/teacher/${result.teacherId}`)
        } else {
            setError(result.error || 'هەڵەیەک ڕوویدا')
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Teacher Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ناوی مامۆستا
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                    placeholder="د. ئەحمەد محەمەد"
                />
            </div>

            {/* Subject */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    بابەت
                </label>
                <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                    placeholder="بیرکاری، ئینگلیزی، کیمیا..."
                />
            </div>

            {/* School Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    قوتابخانە
                </label>

                {!showNewSchool ? (
                    <>
                        <select
                            value={formData.schoolId}
                            onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">قوتابخانەیەک هەڵبژێرە</option>
                            {schools.map((school) => (
                                <option key={school.id} value={school.id}>
                                    {school.name}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => setShowNewSchool(true)}
                            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            + قوتابخانەیەکی نوێ زیاد بکە
                        </button>
                    </>
                ) : (
                    <>
                        <input
                            type="text"
                            value={formData.newSchoolName}
                            onChange={(e) => setFormData({ ...formData, newSchoolName: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                            placeholder="ناوی قوتابخانەی نوێ"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setShowNewSchool(false)
                                setFormData({ ...formData, newSchoolName: '' })
                            }}
                            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            ← گەڕانەوە بۆ هەڵبژاردنی قوتابخانە
                        </button>
                    </>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'چاوەڕوان بە...' : 'زیادکردن'}
            </button>
        </form>
    )
}
