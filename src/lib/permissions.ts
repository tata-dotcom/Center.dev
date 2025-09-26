import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function checkGroupAccess(groupId: string, userId: string) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, assigned_groups')
    .eq('id', userId)
    .single()

  if (!profile) return false

  // Admin has access to all groups
  if (profile.role === 'admin') return true

  // Secretary/Teacher can only access assigned groups
  return profile.assigned_groups?.includes(groupId) || false
}

export async function getAccessibleGroups(userId: string) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, assigned_groups')
    .eq('id', userId)
    .single()

  if (!profile) return []

  // Admin can see all groups
  if (profile.role === 'admin') {
    const { data: groups } = await supabase
      .from('groups')
      .select('id, name, subject')
      .eq('status', 'active')
    
    return groups || []
  }

  // Secretary/Teacher can only see assigned groups
  if (profile.assigned_groups?.length) {
    const { data: groups } = await supabase
      .from('groups')
      .select('id, name, subject')
      .in('id', profile.assigned_groups)
      .eq('status', 'active')
    
    return groups || []
  }

  return []
}