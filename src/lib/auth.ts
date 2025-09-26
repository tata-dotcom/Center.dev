import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Get user profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return { user: session.user, profile }
}

export async function requireRole(allowedRoles: string[]) {
  const { profile } = await getUser()
  
  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect('/dashboard')
  }
  
  return profile
}