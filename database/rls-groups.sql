-- Row Level Security policies for groups table

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin full access to groups" ON groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Teachers can view all groups but only edit their own
CREATE POLICY "Teachers can view all groups" ON groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('teacher', 'secretary')
    )
  );

CREATE POLICY "Teachers can edit own groups" ON groups
  FOR UPDATE USING (
    teacher_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Secretaries can only view groups
CREATE POLICY "Secretaries can view groups" ON groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'secretary'
    )
  );