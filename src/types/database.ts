export interface Student {
  id: string
  name_student: string
  phone_number: string
  academic_year?: string
  paid_amount: number
  remaining_amount: number
  current_sessions: number
  deducted_sessions: number
  created_at: string
}

export interface Subscription {
  id: string
  student_id: string
  total_sessions: number
  remaining_sessions: number
  start_date: string
  end_date?: string
  status: 'active' | 'expired' | 'finished'
  created_at: string
}

export interface AttendanceLog {
  id: string
  student_id: string
  subscription_id: string
  scan_time: string
  note?: string
}

export interface Group {
  id: string
  name: string
  description?: string
  subject: string
  level: string
  max_students: number
  session_price: number
  schedule_days: string[]
  schedule_time: string
  duration_minutes: number
  teacher_id?: string
  created_by?: string
  created_at: string
  updated_at: string
  members?: number
}

export interface GroupStudent {
  id: string
  group_id: string
  student_id: string
  enrolled_at: string
  status: 'active' | 'inactive' | 'completed'
}

export interface GroupSession {
  id: string
  group_id: string
  session_date: string
  start_time: string
  end_time?: string
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  qr_token?: string
  qr_expires_at?: string
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  full_name: string
  email?: string
  phone?: string
  created_at: string
}

export interface UserRole {
  user_id: string
  role: 'admin' | 'teacher' | 'secretary'
}