import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedActionProps {
  children: ReactNode
  requiredPermission: 'create' | 'edit' | 'delete' | 'view' | 'manage'
  groupTeacherId?: string
  fallback?: ReactNode
}

export function ProtectedAction({ 
  children, 
  requiredPermission, 
  groupTeacherId, 
  fallback = null 
}: ProtectedActionProps) {
  const { permissions, loading } = useAuth()

  if (loading) return null

  const hasPermission = () => {
    switch (requiredPermission) {
      case 'create':
        return permissions.canCreateGroups
      case 'edit':
        return permissions.canEditGroup(groupTeacherId)
      case 'delete':
        return permissions.canDeleteGroups
      case 'view':
        return permissions.canViewGroups
      case 'manage':
        return permissions.canManageRegistrations
      default:
        return false
    }
  }

  return hasPermission() ? <>{children}</> : <>{fallback}</>
}