import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Prevent crash during build/module evaluation if vars are missing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

// Database types
export type School = {
  id: string
  name: string
  city: string
  created_at: string
}

export type Teacher = {
  id: string
  name: string
  subject: string
  school_id: string | null
  image_url: string | null
  avg_rating: number
  total_reviews: number
  created_at: string
  updated_at: string
}

export type Review = {
  id: string
  teacher_id: string
  user_name: string
  user_phone: string
  device_id: string
  rating: number
  comment: string
  is_hidden: boolean
  report_count: number
  helpful_count: number
  created_at: string
}

export type ReviewReport = {
  id: string
  review_id: string
  reporter_device_id: string
  reason: string | null
  created_at: string
}

export type ReviewHelpfulVote = {
  id: string
  review_id: string
  voter_device_id: string
  created_at: string
}
