'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/userStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize } = useUserStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}