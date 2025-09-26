-- ============================
-- Educational Center Management System Database Schema
-- Supabase/PostgreSQL
-- ============================

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================
-- 1. DROP OLD TABLES (Reset)
-- ============================
DROP TABLE IF EXISTS group_sessions CASCADE;
DROP TABLE IF EXISTS group_students CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS attendance_logs CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- ============================
-- 2. CREATE BASE TABLES
-- ============================

-- Users table (linked with Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles table (RBAC)
CREATE TABLE user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin','teacher','secretary'))
);

-- Students
CREATE TABLE students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_student VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    academic_year VARCHAR(50),
    paid_amount DECIMAL(10,2) DEFAULT 0,
    remaining_amount DECIMAL(10,2) DEFAULT 0,
    current_sessions INT DEFAULT 0,
    deducted_sessions INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    total_sessions INT NOT NULL,
    remaining_sessions INT NOT NULL,
    start_date DATE DEFAULT NOW(),
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active','expired','finished')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance logs
CREATE TABLE attendance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    scan_time TIMESTAMPTZ DEFAULT NOW(),
    note TEXT
);

-- Groups
CREATE TABLE groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    level TEXT NOT NULL,
    max_students INT DEFAULT 20 CHECK (max_students > 0),
    session_price DECIMAL(10,2) NOT NULL CHECK (session_price > 0),
    schedule_days TEXT[] NOT NULL,
    schedule_time TIME NOT NULL,
    duration_minutes INT DEFAULT 60 CHECK (duration_minutes > 0),
    teacher_id UUID REFERENCES profiles(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relation between students and groups
CREATE TABLE group_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','completed')),
    UNIQUE(group_id, student_id)
);

-- Group sessions
CREATE TABLE group_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','active','completed','cancelled')),
    qr_token TEXT UNIQUE,
    qr_expires_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- 3. PERFORMANCE INDEXES
-- ============================
CREATE INDEX idx_students_phone ON students(phone_number);
CREATE INDEX idx_subscriptions_student ON subscriptions(student_id);
CREATE INDEX idx_attendance_student ON attendance_logs(student_id);
CREATE INDEX idx_group_students_group ON group_students(group_id);
CREATE INDEX idx_group_sessions_group ON group_sessions(group_id);

-- ============================
-- 4. RLS ENABLE
-- ============================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_sessions ENABLE ROW LEVEL SECURITY;

-- ============================
-- 5. RLS POLICIES (Detailed)
-- ============================
-- Admins full access
CREATE POLICY admin_all_profiles ON profiles FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY admin_all_roles ON user_roles FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

-- Teachers: can only SELECT their groups
CREATE POLICY teacher_select_groups ON groups FOR SELECT
USING (teacher_id = auth.uid() AND EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'teacher'));

-- Secretaries: read/write students & attendance
CREATE POLICY secretary_students_rw ON students FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'secretary'));

CREATE POLICY secretary_attendance_rw ON attendance_logs FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'secretary'));

-- Groups (admins manage, secretaries view)
CREATE POLICY admin_groups_rw ON groups FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY secretary_groups_read ON groups FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'secretary'));

-- Group Students
CREATE POLICY admin_group_students_rw ON group_students FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY secretary_group_students_rw ON group_students FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'secretary'));

-- Group Sessions
CREATE POLICY admin_group_sessions_rw ON group_sessions FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY teacher_group_sessions_rw ON group_sessions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = group_sessions.group_id AND g.teacher_id = auth.uid()
  )
  AND EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'teacher')
);

-- ============================
-- 6. TRIGGER: Deduct remaining_sessions on attendance
-- ============================
CREATE OR REPLACE FUNCTION deduct_remaining_sessions()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE subscriptions
  SET remaining_sessions = GREATEST(remaining_sessions - 1, 0)
  WHERE id = NEW.subscription_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_sessions
AFTER INSERT ON attendance_logs
FOR EACH ROW EXECUTE FUNCTION deduct_remaining_sessions();