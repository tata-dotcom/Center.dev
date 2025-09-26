'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const inviteCode = formData.get('inviteCode') as string

  const supabase = createServerActionClient({ cookies })

  // Validate invite code if provided
  let role = 'secretary'
  let assignedGroups: string[] = []

  if (inviteCode) {
    const { data: invite } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', inviteCode)
      .eq('is_active', true)
      .single()

    if (!invite || invite.expires_at < new Date().toISOString()) {
      return { error: 'Invalid or expired invite code' }
    }

    if (invite.used_count >= invite.max_uses) {
      return { error: 'Invite code has been used maximum times' }
    }

    role = invite.role
    assignedGroups = invite.assigned_groups || []

    // Update invite code usage
    await supabase
      .from('invite_codes')
      .update({ used_count: invite.used_count + 1 })
      .eq('id', invite.id)
  }

  // Sign up user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        role,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create profile
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      full_name: fullName,
      phone,
      role,
      assigned_groups: assignedGroups,
    })
  }

  redirect('/dashboard')
}