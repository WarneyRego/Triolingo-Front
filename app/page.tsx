'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { isAuthenticated, userLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Marcar o componente como montado para evitar erros de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !userLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [mounted, isAuthenticated, userLoading, router]);

  // Não renderizar nada até que o componente esteja montado
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100">
      <div className="flex items-center justify-center space-x-2">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-green-600"></div>
        <span className="text-lg font-medium text-green-600">Carregando...</span>
      </div>
    </div>
  );
}