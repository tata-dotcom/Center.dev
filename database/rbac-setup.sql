-- RBAC Setup for Educational Center Management System

-- 1. Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('admin','teacher','secretary'))
);

-- 2. Insert admin user (REPLACE WITH YOUR USER ID)
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR-USER-ID-HERE', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- 3. Drop existing problematic RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can manage all students" ON students;
DROP POLICY IF EXISTS "Secretary/Teacher can view assigned group students" ON students;

-- 4. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 5. Safe RLS policies using user_roles

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Groups policies
CREATE POLICY "Admin full access to groups" ON groups
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "All users can view groups" ON groups
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid())
  );

CREATE POLICY "Teachers can update own groups" ON groups
  FOR UPDATE USING (
    teacher_id = auth.uid() AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'teacher')
  );

-- Students policies
CREATE POLICY "Admin can manage all students" ON students
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Secretary can manage students" ON students
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('secretary', 'admin'))
  );

CREATE POLICY "Teachers can view students" ON students
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin', 'secretary'))
  );

-- Group students policies
CREATE POLICY "Admin can manage all enrollments" ON group_students
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Secretary can manage enrollments" ON group_students
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('secretary', 'admin'))
  );

CREATE POLICY "Teachers can view enrollments" ON group_students
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid())
  );

-- Attendances policies
CREATE POLICY "Admin can manage all attendances" ON attendances
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Teachers can manage attendances for their groups" ON attendances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN group_sessions gs ON gs.group_id IN (
        SELECT id FROM groups WHERE teacher_id = auth.uid()
      )
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('teacher', 'admin')
      AND gs.id = attendances.group_session_id
    )
  );

-- Payments policies
CREATE POLICY "Admin can manage all payments" ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Secretary can manage payments" ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('secretary', 'admin'))
  );