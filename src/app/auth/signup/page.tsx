'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SignUpForm from '@/components/auth/SginupForm';
import { useUserStore } from '@/store/userStore';

export default function SignUpPage() {
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

  return <SignUpForm />;
}
