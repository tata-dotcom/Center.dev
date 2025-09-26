-- Row Level Security (RLS) Policies for Educational Center Management System

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Students policies
CREATE POLICY "Admin can manage all students" ON students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Secretary/Teacher can view assigned group students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN group_students gs ON gs.student_id = students.id
      WHERE p.id = auth.uid() 
      AND (p.role = 'admin' OR gs.group_id = ANY(p.assigned_groups))
    )
  );

-- Payments policies
CREATE POLICY "Admin can manage all payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Secretary can view payments for assigned students" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN group_students gs ON gs.student_id = payments.student_id
      WHERE p.id = auth.uid() 
      AND (p.role = 'admin' OR gs.group_id = ANY(p.assigned_groups))
    )
  );

-- Groups policies
CREATE POLICY "Admin can manage all groups" ON groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Secretary/Teacher can view assigned groups" ON groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND (p.role = 'admin' OR groups.id = ANY(p.assigned_groups))
    )
  );

-- Group students policies
CREATE POLICY "Admin can manage all enrollments" ON group_students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Secretary/Teacher can view assigned group enrollments" ON group_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND (p.role = 'admin' OR group_students.group_id = ANY(p.assigned_groups))
    )
  );

-- Group sessions policies
CREATE POLICY "Admin can manage all sessions" ON group_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Secretary/Teacher can manage assigned group sessions" ON group_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND (p.role = 'admin' OR group_sessions.group_id = ANY(p.assigned_groups))
    )
  );

-- QR codes policies
CREATE POLICY "Admin can manage all QR codes" ON qr_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Secretary/Teacher can view QR codes for assigned students" ON qr_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN group_students gs ON gs.student_id = qr_codes.student_id
      WHERE p.id = auth.uid() 
      AND (p.role = 'admin' OR gs.group_id = ANY(p.assigned_groups))
    )
  );

-- Attendances policies
CREATE POLICY "Admin can manage all attendances" ON attendances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Secretary/Teacher can manage attendances for assigned groups" ON attendances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN group_sessions gs ON gs.id = attendances.group_session_id
      WHERE p.id = auth.uid() 
      AND (p.role = 'admin' OR gs.group_id = ANY(p.assigned_groups))
    )
  );

-- Invite codes policies (Admin only)
CREATE POLICY "Only admin can manage invite codes" ON invite_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );