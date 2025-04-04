'use client';

import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EmployeeProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isEmployee, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/Admin');
      } else if (!isEmployee) {
        router.push('/');
      }
    }
  }, [user, isEmployee, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user && isEmployee ? <>{children}</> : null;
}