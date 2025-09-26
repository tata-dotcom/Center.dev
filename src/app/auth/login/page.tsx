'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { useUserStore } from '@/store/userStore';

export default function LoginPage() {
  const router = useRouter();
  const { user, initialize } = useUserStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  if (user) {
    return null; // Prevent flash while redirecting
  }

  return <LoginForm />;
}
