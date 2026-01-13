'use server'

import { supabase } from '@/lib/supabase'
import { validatePhone } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export type SubmitReviewResult = {
    success?: boolean
    error?: string
}

export async function submitReview(data: {
    teacherId: string
    userName: string
    userPhone: string
    deviceId: string
    rating: number
    comment: string
}): Promise<SubmitReviewResult> {
    // Validate phone format
    if (!validatePhone(data.userPhone)) {
        return { error: 'ژمارەی مۆبایل نادروستە. دەبێ بە 07 دەست پێبکات' }
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
        return { error: 'تکایە هەڵسەنگاندنێک هەڵبژێرە' }
    }

    // Validate comment length
    if (data.comment.length < 10 || data.comment.length > 500) {
        return { error: 'بۆچوونەکە دەبێ لە نێوان 10 بۆ 500 پیت بێت' }
    }

    // Insert review
    const { error } = await supabase
        .from('reviews')
        .insert({
            teacher_id: data.teacherId,
            user_name: data.userName,
            user_phone: data.userPhone,
            device_id: data.deviceId,
            rating: data.rating,
            comment: data.comment,
        })

    if (error) {
        // Check for unique constraint violation
        if (error.code === '23505') {
            return { error: 'تۆ پێشتر ئەم مامۆستایەت هەڵسەنگاندووە' }
        }
        console.error('Review submission error:', error)
        return { error: 'هەڵەیەک ڕوویدا. تکایە دووبارە هەوڵبدەرەوە' }
    }

    // Revalidate the teacher page
    revalidatePath(`/teacher/${data.teacherId}`)

    return { success: true }
}

export async function reportReview(
    reviewId: string,
    deviceId: string,
    reason?: string
): Promise<SubmitReviewResult> {
    const { error } = await supabase
        .from('review_reports')
        .insert({
            review_id: reviewId,
            reporter_device_id: deviceId,
            reason,
        })

    if (error) {
        if (error.code === '23505') {
            return { error: 'تۆ پێشتر ئەم هەڵسەنگاندنەت گوزارشتکردووە' }
        }
        return { error: 'هەڵەیەک ڕوویدا' }
    }

    revalidatePath('/')
    return { success: true }
}

export async function markReviewHelpful(
    reviewId: string,
    deviceId: string
): Promise<SubmitReviewResult> {
    const { error } = await supabase
        .from('review_helpful_votes')
        .insert({
            review_id: reviewId,
            voter_device_id: deviceId,
        })

    if (error) {
        if (error.code === '23505') {
            return { error: 'تۆ پێشتر ئەم هەڵسەنگاندنەت وەک سوودمەند نیشانکردووە' }
        }
        return { error: 'هەڵەیەک ڕوویدا' }
    }

    revalidatePath('/')
    return { success: true }
}

export async function addTeacher(data: {
    name: string
    subject: string
    schoolId?: string
    newSchoolName?: string
}): Promise<SubmitReviewResult & { teacherId?: string }> {
    let schoolId = data.schoolId

    // If adding new school
    if (data.newSchoolName && !data.schoolId) {
        const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .insert({ name: data.newSchoolName })
            .select('id')
            .single()

        if (schoolError) {
            return { error: 'هەڵە لە زیادکردنی قوتابخانە' }
        }
        schoolId = schoolData.id
    }

    // Insert teacher
    const { data: teacherData, error } = await supabase
        .from('teachers')
        .insert({
            name: data.name,
            subject: data.subject,
            school_id: schoolId,
        })
        .select('id')
        .single()

    if (error) {
        return { error: 'هەڵە لە زیادکردنی مامۆستا' }
    }

    revalidatePath('/')
    return { success: true, teacherId: teacherData.id }
}
