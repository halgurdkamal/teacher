'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

/**
 * Delete a teacher (admin only)
 */
export async function deleteTeacher(teacherId: string) {
    const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacherId)

    if (error) {
        return { error: 'هەڵە لە سڕینەوەی مامۆستا' }
    }

    revalidatePath('/admin')
    return { success: true }
}

/**
 * Hide/unhide a review (admin only)
 */
export async function toggleReviewVisibility(reviewId: string, isHidden: boolean) {
    const { error } = await supabase
        .from('reviews')
        .update({ is_hidden: !isHidden })
        .eq('id', reviewId)

    if (error) {
        return { error: 'هەڵە لە گۆڕینی دۆخی هەڵسەنگاندن' }
    }

    revalidatePath('/admin')
    return { success: true }
}

/**
 * Delete a review (admin only)
 */
export async function deleteReview(reviewId: string) {
    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

    if (error) {
        return { error: 'هەڵە لە سڕینەوەی هەڵسەنگاندن' }
    }

    revalidatePath('/admin')
    return { success: true }
}

/**
 * Get all teachers with stats (admin only)
 */
export async function getAllTeachers() {
    const { data, error } = await supabase
        .from('teachers')
        .select('*, school:schools(name)')
        .order('created_at', { ascending: false })

    if (error) {
        return { error: 'هەڵە لە وەرگرتنی مامۆستایان' }
    }

    return { data }
}

/**
 * Get all reviews with moderation score (admin only)
 */
export async function getAllReviews() {
    const { data, error } = await supabase
        .from('reviews')
        .select(`
      *,
      teacher:teachers(name, subject)
    `)
        .order('created_at', { ascending: false })

    if (error) {
        return { error: 'هەڵە لە وەرگرتنی هەڵسەنگاندنەکان' }
    }

    return { data }
}

/**
 * Get reported reviews (admin only)
 */
export async function getReportedReviews() {
    const { data, error } = await supabase
        .from('reviews')
        .select(`
      *,
      teacher:teachers(name, subject)
    `)
        .gt('report_count', 0)
        .order('report_count', { ascending: false })

    if (error) {
        return { error: 'هەڵە لە وەرگرتنی هەڵسەنگاندنە گوزارشتکراوەکان' }
    }

    return { data }
}

/**
 * Update teacher info (admin only)
 */
export async function updateTeacher(teacherId: string, data: {
    name?: string
    subject?: string
    schoolId?: string
}) {
    const { error } = await supabase
        .from('teachers')
        .update({
            name: data.name,
            subject: data.subject,
            school_id: data.schoolId,
            updated_at: new Date().toISOString(),
        })
        .eq('id', teacherId)

    if (error) {
        return { error: 'هەڵە لە نوێکردنەوەی مامۆستا' }
    }

    revalidatePath('/admin')
    return { success: true }
}

/**
 * Add fake review for testing (admin only)
 */
export async function addFakeReview(data: {
    teacherId: string
    userName: string
    userPhone: string
    rating: number
    comment: string
}) {
    // Generate a fake device ID for admin-added reviews
    const fakeDeviceId = `admin-${Date.now()}-${Math.random().toString(36).substring(7)}`

    const { error } = await supabase
        .from('reviews')
        .insert({
            teacher_id: data.teacherId,
            user_name: data.userName,
            user_phone: data.userPhone,
            device_id: fakeDeviceId,
            rating: data.rating,
            comment: data.comment,
        })

    if (error) {
        return { error: 'هەڵە لە زیادکردنی هەڵسەنگاندن' }
    }

    revalidatePath('/admin')
    revalidatePath(`/teacher/${data.teacherId}`)
    return { success: true }
}

