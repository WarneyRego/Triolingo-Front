'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LessonContainer from '@/components/lessons/LessonContainer';
import { Lesson } from '@/components/lessons/LessonTypes';
import { loadLesson } from '@/lib/lessons';
import PageTransition from '@/components/ui/page-transition';
import AnimatedBackground from '@/components/ui/animated-background';
import MotionText from '@/components/ui/motion-text';
import MotionCard from '@/components/ui/motion-card';
import MotionButton from '@/components/ui/motion-button';
import { useTheme } from '@/components/ui/theme-provider';

export default function LessonPage() {
  const { isAuthenticated, userLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obter o ID da lição e o idioma dos parâmetros de consulta
  const lessonId = searchParams.get('id');
  const language = searchParams.get('language');

  useEffect(() => {
    // Verificar autenticação
    if (!userLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Verificar se temos os parâmetros necessários
    if (!lessonId || !language) {
      setError('ID da lição ou idioma não especificado');
      setLoading(false);
      return;
    }

    // Carregar dados da lição diretamente do arquivo JSON
    const initializeLesson = async () => {
      try {
        // Carregar a lição
        const lessonData = await loadLesson(lessonId, language);
        setLesson(lessonData);
      } catch (err) {
        console.error('Erro ao carregar lição:', err);
        setError('Não foi possível carregar a lição. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    initializeLesson();
  }, [lessonId, language, isAuthenticated, userLoading, router]);

  // Handler para quando o usuário escolhe retornar ao dashboard após finalizar a lição
  const handleLessonComplete = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <PageTransition>
        <AnimatedBackground isDarkMode={isDarkMode}>
          <div className="flex min-h-screen flex-col items-center justify-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-primary-color"></div>
              <MotionText as="span" className="text-lg font-medium text-primary-color">
                Carregando lição...
              </MotionText>
            </div>
          </div>
        </AnimatedBackground>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <AnimatedBackground isDarkMode={isDarkMode}>
          <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <MotionCard className="w-full max-w-md p-6" delay={0.2}>
              <MotionText as="h1" className="mb-4 text-xl font-bold text-error" delay={0.3}>
                Erro
              </MotionText>
              <MotionText as="p" className="mb-6 text-secondary" delay={0.4}>
                {error}
              </MotionText>
              <MotionButton 
                onClick={() => router.push('/dashboard')}
                className="w-full"
                delay={0.5}
              >
                Voltar ao Dashboard
              </MotionButton>
            </MotionCard>
          </div>
        </AnimatedBackground>
      </PageTransition>
    );
  }

  if (!lesson) {
    return (
      <PageTransition>
        <AnimatedBackground isDarkMode={isDarkMode}>
          <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <MotionCard className="w-full max-w-md p-6" delay={0.2}>
              <MotionText as="h1" className="mb-4 text-xl font-bold text-error" delay={0.3}>
                Lição Não Encontrada
              </MotionText>
              <MotionText as="p" className="mb-6 text-secondary" delay={0.4}>
                Não foi possível encontrar a lição solicitada.
              </MotionText>
              <MotionButton 
                onClick={() => router.push('/dashboard')}
                className="w-full"
                delay={0.5}
              >
                Voltar ao Dashboard
              </MotionButton>
            </MotionCard>
          </div>
        </AnimatedBackground>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <AnimatedBackground isDarkMode={isDarkMode}>
        <div className="min-h-screen py-8">
          <div className="container mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <MotionButton
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2"
                variant="secondary"
                delay={0.2}
              >
                <span>←</span> Voltar ao Dashboard
              </MotionButton>
            </div>

            <MotionCard delay={0.3}>
              <LessonContainer 
                lesson={lesson} 
                onComplete={handleLessonComplete}
                isDarkMode={isDarkMode}
              />
            </MotionCard>
          </div>
        </div>
      </AnimatedBackground>
    </PageTransition>
  );
} 