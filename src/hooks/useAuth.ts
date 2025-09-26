import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface UserProfile {
  id: string
  role: 'admin' | 'teacher' | 'secretary'
  full_name: string
  email: string
}

interface UserPermissions {
  canViewGroups: boolean
  canCreateGroups: boolean
  canEditGroups: boolean
  canDeleteGroups: boolean
  canManageRegistrations: boolean
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState<UserPermissions>({
    canViewGroups: false,
    canCreateGroups: false,
    canEditGroups: false,
    canDeleteGroups: false,
    canManageRegistrations: false
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single()

        if (userRole) {
          const profile = {
            id: session.user.id,
            role: userRole.role,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
            email: session.user.email || ''
          }
          setUser(profile)
          setPermissions(getPermissions(profile.role, profile.id))
        }
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single()

        if (userRole) {
          const profile = {
            id: session.user.id,
            role: userRole.role,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
            email: session.user.email || ''
          }
          setUser(profile)
          setPermissions(getPermissions(profile.role, profile.id))
        }
      } else {
        setUser(null)
        setPermissions({
          canViewGroups: false,
          canCreateGroups: false,
          canEditGroups: false,
          canDeleteGroups: false,
          canManageRegistrations: false
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const getPermissions = (role: string, userId: string): UserPermissions => {
    switch (role) {
      case 'admin':
        return {
          canViewGroups: true,
          canCreateGroups: true,
          canEditGroups: true,
          canDeleteGroups: true,
          canManageRegistrations: true
        }
      case 'teacher':
        return {
          canViewGroups: true,
          canCreateGroups: false,
          canEditGroups: true, // Only their own groups (checked in UI)
          canDeleteGroups: false,
          canManageRegistrations: false
        }
      case 'secretary':
        return {
          canViewGroups: true,
          canCreateGroups: false,
          canEditGroups: false,
          canDeleteGroups: false,
          canManageRegistrations: true
        }
      default:
        return {
          canViewGroups: false,
          canCreateGroups: false,
          canEditGroups: false,
          canDeleteGroups: false,
          canManageRegistrations: false
        }
    }
  }

  return { user, permissions, loading }
}