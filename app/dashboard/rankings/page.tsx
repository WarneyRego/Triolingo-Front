'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Rankings } from '@/components/ui/rankings';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

export default function RankingsPage() {
  const { user, userLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Carregando...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen">
      <header className="bg-primary-color shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-white">Triolingo</h1>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <span className="text-sm font-medium text-white">Olá, {user?.name || 'Usuário'}</span>
            <button
              onClick={handleLogout}
              className="rounded-md bg-white px-3 py-1 text-sm font-medium text-primary-color hover:bg-opacity-90"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4">
        <div className="mb-6">
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center rounded-md bg-opacity-10 px-4 py-2 text-sm font-medium hover:bg-opacity-20"
          >
            ← Voltar ao Dashboard
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">Classificação dos Jogadores</h1>
            <p className="text-secondary mb-8">Veja quem são os melhores estudantes de idiomas!</p>
            
            <Rankings 
              initialLanguage={user?.targetLanguages && user.targetLanguages.length > 0 
                ? user.targetLanguages[0] 
                : 'english'
              }
              className="p-0" 
            />
          </div>
        </div>
      </main>
    </div>
  );
} 