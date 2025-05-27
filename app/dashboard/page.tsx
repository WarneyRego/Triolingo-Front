'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getRecentProgress, LessonProgressData } from '@/lib/firebase';
import { Rankings } from '@/components/ui/rankings';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { useTheme } from '@/components/ui/theme-provider';
import PageTransition from '@/components/ui/page-transition';
import AnimatedBackground from '@/components/ui/animated-background';
import MotionText from '@/components/ui/motion-text';
import MotionCard from '@/components/ui/motion-card';
import MotionButton from '@/components/ui/motion-button';
import FloatingElement from '@/components/ui/floating-element';
import Navbar from '@/components/ui/navbar';

// Interface para os dados da lição
interface LessonInfo {
  id: string;
  title: string;
  description: string;
  level: number;
}

export default function Dashboard() {
  const { user, userLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [availableLessons, setAvailableLessons] = useState<LessonInfo[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [recentProgress, setRecentProgress] = useState<LessonProgressData[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  
  // Altura mínima para os cards
  const CARD_MIN_HEIGHT = 'min-h-[280px]';

  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [userLoading, isAuthenticated, router]);

  // Buscar o progresso recente quando o usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated && !userLoading) {
      fetchRecentProgress();
    }
  }, [isAuthenticated, userLoading]);

  // Função para buscar o progresso recente
  const fetchRecentProgress = async () => {
    try {
      setLoadingProgress(true);
      console.log('Iniciando busca de progresso recente...');
      
      const data = await getRecentProgress();
      
      if (!data || !data.progress || !Array.isArray(data.progress)) {
        console.error('Resposta da API inválida:', data);
        setRecentProgress([]);
        return;
      }
      
      console.log(`Recebidos ${data.progress.length} registros de progresso`);
      
      // Filtrar registros inválidos
      const validProgress = data.progress.filter(item => 
        item && item.lessonId && item.language && 
        typeof item.score === 'number' && 
        typeof item.totalExercises === 'number'
      );
      
      if (validProgress.length < data.progress.length) {
        console.warn(`Filtrados ${data.progress.length - validProgress.length} registros inválidos`);
      }
      
      // Ordenar por data de atualização (mais recente primeiro)
      const sortedProgress = validProgress.sort((a, b) => {
        if (!a.lastUpdated) return 1;
        if (!b.lastUpdated) return -1;
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      });
      
      // Pegar apenas os 5 mais recentes
      setRecentProgress(sortedProgress.slice(0, 5));
      console.log('Progresso recente atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao buscar progresso recente:', error);
      setRecentProgress([]);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Função para mostrar as lições disponíveis para o idioma selecionado
  const handleShowLessons = async (language: string) => {
    setLoadingLessons(true);
    setSelectedLanguage(language);
    
    // Mapeamento entre os nomes de idiomas e seus códigos
    const languageCodes: Record<string, string> = {
      'english': 'en',
      'spanish': 'es',
      'french': 'fr',
      'german': 'de',
      'italian': 'it',
      'japanese': 'ja',
      'korean': 'ko',
      'chinese': 'zh',
      'russian': 'ru',
      'portuguese': 'pt'
    };
    
    const languageCode = languageCodes[language] || 'en';
    
    try {
      // Carregar arquivo JSON da pasta public/data via fetch
      console.log(`Carregando lição para ${languageCode} via fetch`);
      const response = await fetch(`/data/lesson1-${languageCode}.json`);
      
      if (!response.ok) {
        console.error(`Erro ao carregar lição: ${response.status} ${response.statusText}`);
        throw new Error(`Erro ao carregar lições: ${response.status} ${response.statusText}`);
      }
      
      const lessonData = await response.json();
      console.log(`Lição carregada com sucesso: ${Object.keys(lessonData).join(', ')}`);
      
      // Verificar se o formato contém a propriedade 'lessons'
      if (lessonData.lessons && Array.isArray(lessonData.lessons)) {
        // Extrair o array de lições
        setAvailableLessons(lessonData.lessons.map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          level: lesson.level
        })));
        console.log(`${lessonData.lessons.length} lições disponíveis`);
      } else {
        // Formato antigo: apenas uma lição
        setAvailableLessons([{
          id: lessonData.id,
          title: lessonData.title,
          description: lessonData.description,
          level: lessonData.level
        }]);
        console.log('Uma lição disponível (formato antigo)');
      }
    } catch (error) {
      console.error('Erro ao carregar lições:', error);
      setAvailableLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  };

  // Função para navegar para a lição selecionada
  const navigateToLesson = (lessonId: string) => {
    if (!selectedLanguage) return;
    
    const languageCodes: Record<string, string> = {
      'english': 'en',
      'spanish': 'es',
      'french': 'fr',
      'german': 'de',
      'italian': 'it',
      'japanese': 'ja',
      'korean': 'ko',
      'chinese': 'zh',
      'russian': 'ru',
      'portuguese': 'pt'
    };
    
    const languageCode = languageCodes[selectedLanguage] || 'en';
    
    // Navegar para a página de lições com os parâmetros corretos
    router.push(`/dashboard/lesson?id=${lessonId}&language=${languageCode}`);
  };

  // Função para voltar à seleção de idiomas
  const handleBackToLanguages = () => {
    setSelectedLanguage(null);
    setAvailableLessons([]);
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <MotionText as="h2" className="text-2xl font-semibold text-gray-900">
            Carregando...
          </MotionText>
        </div>
      </div>
    );
  }

  // Renderizar lições disponíveis se um idioma estiver selecionado
  if (selectedLanguage) {
    return (
      <PageTransition>
        <AnimatedBackground isDarkMode={isDarkMode}>
          <div className="min-h-screen">
            <Navbar 
              user={user?.name ? { name: user.name } : undefined} 
              onLogout={handleLogout}
            />

            <main className="mx-auto max-w-7xl p-4">
              <section className="mb-8">
                <div className="flex items-center mb-6">
                  <MotionButton
                    onClick={handleBackToLanguages}
                    className={`mr-4 ${isDarkMode ? '!bg-neutral-800 !text-text-primary' : '!bg-gray-100 !text-gray-700'} !px-4 !py-2 rounded-md`}
                  >
                    ← Voltar
                  </MotionButton>
                  <MotionText 
                    as="h2" 
                    className={`text-2xl font-bold ${isDarkMode ? 'text-text-primary' : 'text-gray-800'} capitalize`}
                  >
                    Lições de {selectedLanguage}
                  </MotionText>
                </div>

                {loadingLessons ? (
                  <div className="flex justify-center p-12">
                    <div className="flex items-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-green-600 mr-2"></div>
                      <span>Carregando lições...</span>
                    </div>
                  </div>
                ) : availableLessons.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {availableLessons.map((lesson, index) => (
                      <MotionCard 
                        key={lesson.id} 
                        delay={index * 0.1}
                        className={`h-full ${CARD_MIN_HEIGHT} transition-all duration-300 hover:shadow-xl ${
                          isDarkMode 
                            ? 'hover:bg-gray-800/80 border border-gray-800' 
                            : 'hover:bg-white border border-gray-200'
                        }`}
                      >
                        <div className="flex flex-col justify-between h-full p-6">
                          <div className="text-center">
                            <div className={`mb-3 inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
                              isDarkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'
                            }`}>
                              Nível {lesson.level}
                            </div>
                            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-text-primary' : 'text-gray-800'}`}>
                              {lesson.title}
                            </h3>
                            <p className={`mb-6 text-sm ${isDarkMode ? 'text-text-secondary' : 'text-gray-600'}`}>
                              {lesson.description}
                            </p>
                          </div>
                          <MotionButton
                            onClick={() => navigateToLesson(lesson.id)}
                            className={`w-full rounded-full ${
                              isDarkMode 
                                ? '!bg-green-600/90 hover:!bg-green-600 !text-white' 
                                : '!bg-green-600 !text-white hover:!bg-green-500'
                            } !px-5 !py-3 !text-sm !font-medium !shadow-md`}
                          >
                            Iniciar
                          </MotionButton>
                        </div>
                      </MotionCard>
                    ))}
                  </div>
                ) : (
                  <MotionCard className={`border ${
                    isDarkMode 
                      ? 'border-gray-800' 
                      : 'border-gray-200'
                  }`}>
                    <div className="p-8 text-center">
                      <p className={`${isDarkMode ? 'text-text-secondary' : 'text-gray-600'}`}>
                        Não há lições disponíveis para este idioma ainda.
                      </p>
                    </div>
                  </MotionCard>
                )}
              </section>
            </main>
          </div>
        </AnimatedBackground>
      </PageTransition>
    );
  }

  // Renderizar a lista de idiomas se nenhum idioma estiver selecionado
  return (
    <PageTransition>
      <AnimatedBackground isDarkMode={isDarkMode}>
        <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-950 to-gray-900' : 'bg-gradient-to-b from-gray-100 to-gray-50'}`}>
          <Navbar 
            user={user?.name ? { name: user.name } : undefined} 
            onLogout={handleLogout}
          />

          <div className={`absolute inset-0 z-0 opacity-10 pointer-events-none bg-repeat`} 
              style={{ 
                backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjAuMTUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PGNpcmNsZSBjeD0iMyIgY3k9IjMiIHI9IjEiLz48Y2lyY2xlIGN4PSIxMyIgY3k9IjEzIiByPSIxIi8+PC9nPjwvc3ZnPg==')" 
              }}>
          </div>

          <div className={`absolute top-0 w-full h-64 ${isDarkMode ? 'bg-gradient-to-b from-primary-color/20 to-transparent' : 'bg-gradient-to-b from-primary-color/10 to-transparent'} z-0`}></div>

          <main className="relative z-10 mx-auto max-w-7xl p-6">
            {/* Banner de boas vindas */}
            <section className="mb-10">
              <div className={`rounded-2xl p-6 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-primary-color/30 to-purple-900/30 border border-primary-color/20' 
                  : 'bg-gradient-to-r from-primary-color/20 to-purple-600/20 border border-primary-color/10'
              } shadow-lg`}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div>
                    <MotionText 
                      as="h1" 
                      className="text-3xl font-bold mb-2"
                      delay={0.1}
                    >
                      Olá, {user?.name || 'Estudante'}!
                    </MotionText>
                    <MotionText 
                      as="p" 
                      className={`${isDarkMode ? 'text-text-secondary' : 'text-gray-600'}`}
                      delay={0.2}
                    >
                      Continue sua jornada de aprendizado hoje.
                    </MotionText>
                  </div>
                  <MotionButton
                    onClick={() => router.push('/language-selection')}
                    className={`mt-4 md:mt-0 rounded-full ${
                      isDarkMode 
                        ? '!bg-primary-color/90 hover:!bg-primary-color !text-white' 
                        : '!bg-primary-color !text-white hover:!bg-primary-color/90'
                    } !px-6 !py-2 !shadow-md`}
                    delay={0.3}
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Adicionar idiomas
                    </span>
                  </MotionButton>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <MotionText 
                as="h2" 
                className={`mb-6 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`} 
                delay={0.1}
              >
                Seus Idiomas
              </MotionText>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {user?.targetLanguages && user.targetLanguages.length > 0 ? (
                  user.targetLanguages.map((lang, index) => (
                    <FloatingElement key={lang}>
                      <MotionCard 
                        delay={index * 0.1 + 0.2} 
                        className={`h-full ${CARD_MIN_HEIGHT} transition-all duration-300 hover:shadow-xl ${
                          isDarkMode 
                            ? 'hover:bg-gray-800/80 border border-gray-800' 
                            : 'hover:bg-white border border-gray-200'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-between h-full p-8">
                          <div className="flex flex-col items-center text-center w-full">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
                              isDarkMode 
                                ? 'bg-gray-800 border border-gray-700' 
                                : 'bg-gray-100 border border-gray-200'
                            }`}>
                              <span className="text-5xl">
                                {lang === 'english' && '🇺🇸'}
                                {lang === 'spanish' && '🇪🇸'}
                                {lang === 'french' && '🇫🇷'}
                                {lang === 'german' && '🇩🇪'}
                                {lang === 'italian' && '🇮🇹'}
                                {lang === 'japanese' && '🇯🇵'}
                                {lang === 'korean' && '🇰🇷'}
                                {lang === 'chinese' && '🇨🇳'}
                                {lang === 'russian' && '🇷🇺'}
                                {lang === 'portuguese' && '🇧🇷'}
                              </span>
                            </div>
                            <MotionText 
                              as="span" 
                              className={`mb-6 text-2xl font-semibold capitalize ${
                                isDarkMode ? 'text-white' : 'text-gray-800'
                              }`} 
                              delay={index * 0.1 + 0.3}
                            >
                              {lang}
                            </MotionText>
                          </div>
                          <MotionButton 
                            onClick={() => handleShowLessons(lang)}
                            className={`rounded-full w-full ${
                              isDarkMode 
                                ? '!bg-primary-color/90 hover:!bg-primary-color !text-white' 
                                : '!bg-primary-color !text-white hover:!bg-primary-color/90'
                            } !px-5 !py-3 !text-sm !font-medium !shadow-md`}
                            delay={index * 0.1 + 0.4}
                          >
                            Iniciar lições
                          </MotionButton>
                        </div>
                      </MotionCard>
                    </FloatingElement>
                  ))
                ) : (
                  <MotionCard className={`col-span-full p-8 text-center ${
                    isDarkMode 
                      ? 'border border-gray-800' 
                      : 'border border-gray-200'
                  }`} delay={0.2}>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Você ainda não selecionou nenhum idioma.{' '}
                      <MotionButton
                        onClick={() => router.push('/language-selection')}
                        className="!bg-transparent !p-0 !shadow-none font-medium text-primary-color hover:underline"
                      >
                        Selecionar idiomas
                      </MotionButton>
                    </p>
                  </MotionCard>
                )}
              </div>
            </section>

            {/* Seção de Jogos e Apostas */}
            <section className="mb-12">
              <MotionText 
                as="h2" 
                className={`mb-6 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`} 
                delay={0.3}
              >
                Jogos e Apostas
              </MotionText>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <FloatingElement>
                  <MotionCard 
                    delay={0.4} 
                    className={`h-full ${CARD_MIN_HEIGHT} transition-all duration-300 hover:shadow-xl ${
                      isDarkMode 
                        ? 'hover:bg-red-900/20 border border-gray-800' 
                        : 'hover:bg-red-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-between h-full p-8">
                      <div className="flex flex-col items-center text-center w-full">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
                          isDarkMode 
                            ? 'bg-red-900/30 border border-red-900/50' 
                            : 'bg-red-100 border border-red-200'
                        }`}>
                          <span className="text-5xl">🎰</span>
                        </div>
                        <MotionText 
                          as="span" 
                          className={`mb-3 text-2xl font-semibold ${
                            isDarkMode ? 'text-amber-300' : 'text-red-700'
                          }`} 
                          delay={0.5}
                        >
                          Roleta da Alegria
                        </MotionText>
                        <MotionText 
                          as="p" 
                          className={`text-sm mb-6 text-center ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`} 
                          delay={0.5}
                        >
                          Aposte seus pontos e multiplique suas recompensas
                        </MotionText>
                      </div>
                      <MotionButton 
                        onClick={() => router.push('/dashboard/roulette')}
                        className={`rounded-full w-full ${
                          isDarkMode 
                            ? '!bg-gradient-to-r from-amber-600 to-amber-800 !text-white hover:opacity-90' 
                            : '!bg-gradient-to-r from-red-500 to-red-700 !text-white hover:opacity-90'
                        } !px-5 !py-3 !text-sm !font-medium !shadow-md`}
                        delay={0.6}
                      >
                        Jogar Agora
                      </MotionButton>
                    </div>
                  </MotionCard>
                </FloatingElement>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Progresso Recente */}
              <section className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <MotionText 
                    as="h2" 
                    className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`} 
                    delay={0.3}
                  >
                    Progresso Recente
                  </MotionText>
                  <MotionButton
                    onClick={() => fetchRecentProgress()}
                    className={`!bg-transparent !shadow-none ${
                      isDarkMode ? 'text-primary-color/90' : 'text-primary-color'
                    } hover:underline !p-0 text-sm font-medium`}
                    delay={0.4}
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      Atualizar
                    </span>
                  </MotionButton>
                </div>
                {loadingProgress ? (
                  <MotionCard 
                    delay={0.4}
                    className={isDarkMode ? 'border border-gray-800' : 'border border-gray-200'}
                  >
                    <div className="flex justify-center p-8">
                      <div className="flex items-center">
                        <div className={`h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 ${
                          isDarkMode ? 'border-primary-color' : 'border-primary-color'
                        } mr-2`}></div>
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Carregando seu progresso...</span>
                      </div>
                    </div>
                  </MotionCard>
                ) : recentProgress.length > 0 ? (
                  <MotionCard 
                    delay={0.4}
                    className={isDarkMode ? 'border border-gray-800' : 'border border-gray-200'}
                  >
                    <div className="overflow-hidden">
                      <table className="min-w-full divide-y divide-border-color">
                        <thead className={isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                              Lição
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                              Idioma
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                              Pontuação
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                              Data
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                          {recentProgress.map((progress, index) => {
                            // Formatação das informações de idioma
                            const languageNames: Record<string, string> = {
                              'en': 'Inglês',
                              'es': 'Espanhol',
                              'fr': 'Francês',
                              'de': 'Alemão',
                              'it': 'Italiano',
                              'ja': 'Japonês',
                              'ko': 'Coreano',
                              'zh': 'Chinês',
                              'ru': 'Russo',
                              'pt': 'Português'
                            };
                            
                            // Formatação da data
                            const date = new Date(progress.lastUpdated);
                            const formattedDate = date.toLocaleDateString('pt-BR');
                            
                            return (
                              <tr key={`${progress.language}_${progress.lessonId}`} className={index % 2 === 0 ? '' : isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50/50'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  {progress.lessonId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                  {languageNames[progress.language] || progress.language}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                  {progress.score}/{progress.totalExercises} ({progress.completionPercentage}%)
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                  {formattedDate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    progress.completed 
                                      ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800' 
                                      : isDarkMode ? 'bg-amber-900 text-amber-200' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {progress.completed ? 'Concluída' : 'Em progresso'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </MotionCard>
                ) : (
                  <MotionCard 
                    delay={0.4}
                    className={isDarkMode ? 'border border-gray-800' : 'border border-gray-200'}
                  >
                    <div className="p-8 text-center">
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Você ainda não completou nenhuma lição. Comece hoje a aprender!
                      </p>
                    </div>
                  </MotionCard>
                )}
              </section>

              {/* Nova seção de Rankings */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <MotionText 
                    as="h2" 
                    className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`} 
                    delay={0.5}
                  >
                    Rankings
                  </MotionText>
                  <MotionButton
                    onClick={() => router.push('/dashboard/rankings')}
                    className={`!bg-transparent !shadow-none ${
                      isDarkMode ? 'text-primary-color/90' : 'text-primary-color'
                    } hover:underline !p-0 text-sm font-medium`}
                    delay={0.6}
                  >
                    Ver todos →
                  </MotionButton>
                </div>
                <MotionCard 
                  delay={0.7}
                  className={isDarkMode ? 'border border-gray-800' : 'border border-gray-200'}
                >
                  <Rankings 
                    initialLanguage={user?.targetLanguages && user.targetLanguages.length > 0 
                      ? user.targetLanguages[0] 
                      : 'english'
                    } 
                  />
                </MotionCard>
              </section>
            </div>
          </main>
        </div>
      </AnimatedBackground>
    </PageTransition>
  );
} 