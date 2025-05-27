'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import PageTransition from '@/components/ui/page-transition';
import AnimatedBackground from '@/components/ui/animated-background';
import MotionText from '@/components/ui/motion-text';
import MotionCard from '@/components/ui/motion-card';
import MotionButton from '@/components/ui/motion-button';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ui/theme-provider';

interface Language {
  id: string;
  name: string;
  flag: string;
}

const availableLanguages: Language[] = [
  { id: 'english', name: 'Inglês', flag: '🇺🇸' },
  { id: 'spanish', name: 'Espanhol', flag: '🇪🇸' },
  { id: 'french', name: 'Francês', flag: '🇫🇷' },
];

interface LanguageSelectionProps {
  isDarkMode?: boolean;
}

export default function LanguageSelection({ isDarkMode: propIsDarkMode }: LanguageSelectionProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const { updateLanguages, user, userLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  // Use a propriedade se fornecida, caso contrário, use o valor do contexto
  const isDarkMode = propIsDarkMode !== undefined ? propIsDarkMode : theme === 'dark';

  // Marcar componente como montado para evitar erros de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirecionar se o usuário não estiver autenticado
  useEffect(() => {
    if (mounted && !userLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, userLoading, isAuthenticated, router]);
  
  // Carregar idiomas já selecionados pelo usuário
  useEffect(() => {
    if (mounted && user && user.targetLanguages && user.targetLanguages.length > 0) {
      // Se o usuário já tem idiomas selecionados, carregá-los
      setSelectedLanguages(user.targetLanguages);
    }
  }, [mounted, user]);
  
  const toggleLanguage = (languageId: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(languageId)) {
        return prev.filter(id => id !== languageId);
      } else {
        return [...prev, languageId];
      }
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (selectedLanguages.length === 0) {
      setErrorMessage('Por favor, selecione pelo menos um idioma');
      return;
    }
    
    setLoading(true);
    
    try {
      await updateLanguages(selectedLanguages);
      // Redirecionar para o dashboard após a seleção
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Ocorreu um erro ao salvar suas preferências. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Evitar renderização no lado do servidor para componentes que dependem do estado do cliente
  if (!mounted) {
    return null;
  }
  
  if (userLoading) {
    return (
      <AnimatedBackground isDarkMode={isDarkMode}>
        <div className="flex min-h-screen items-center justify-center">
          <MotionCard delay={0.2} className="p-6 text-center">
            <MotionText as="h2" className="text-2xl font-semibold text-primary" delay={0.3}>
              Carregando...
            </MotionText>
          </MotionCard>
        </div>
      </AnimatedBackground>
    );
  }
  
  const decorationCircleVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 1.5, 
        ease: "easeOut" 
      }
    }
  };
  
  return (
    <PageTransition>
      <AnimatedBackground isDarkMode={isDarkMode}>
        {/* Elementos decorativos flutuantes (visíveis apenas no tema claro) */}
        {!isDarkMode && (
          <>
            <motion.div 
              className="fixed top-[15%] right-[10%] w-16 h-16 rounded-full bg-gradient-to-r from-accent-1 to-accent-2 opacity-30 z-[1]"
              initial="initial"
              animate="animate"
              variants={decorationCircleVariants}
              style={{ filter: "blur(15px)" }}
            />
            <motion.div 
              className="fixed bottom-[20%] left-[8%] w-20 h-20 rounded-full bg-gradient-to-r from-accent-3 to-primary-color opacity-20 z-[1]"
              initial="initial"
              animate="animate"
              variants={decorationCircleVariants}
              style={{ filter: "blur(20px)" }}
              transition={{ delay: 0.3 }}
            />
            <motion.div 
              className="fixed top-[35%] left-[15%] w-12 h-12 rounded-full bg-gradient-to-r from-accent-2 to-accent-3 opacity-15 z-[1]"
              initial="initial"
              animate="animate"
              variants={decorationCircleVariants}
              style={{ filter: "blur(10px)" }}
              transition={{ delay: 0.6 }}
            />
          </>
        )}
        
        {/* Elementos decorativos para tema escuro */}
        {isDarkMode && (
          <>
            <motion.div 
              className="fixed top-[15%] right-[10%] w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 opacity-30 z-[1]"
              initial="initial"
              animate="animate"
              variants={decorationCircleVariants}
              style={{ filter: "blur(15px)" }}
            />
            <motion.div 
              className="fixed bottom-[20%] left-[8%] w-20 h-20 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 opacity-20 z-[1]"
              initial="initial"
              animate="animate"
              variants={decorationCircleVariants}
              style={{ filter: "blur(20px)" }}
              transition={{ delay: 0.3 }}
            />
          </>
        )}
        
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <MotionCard delay={0.2} className={`w-full max-w-2xl space-y-8 p-6 ${!isDarkMode ? 'glass-light' : 'glass-dark'}`}>
            <div className="text-center">
              <MotionText 
                as="h1" 
                className="text-3xl font-bold text-primary-color"
                delay={0.3}
                staggerChildren
              >
                Triolingo
              </MotionText>
              <MotionText 
                as="h2" 
                className="mt-2 text-2xl font-semibold text-primary"
                delay={0.4}
              >
                Quais idiomas você quer aprender?
              </MotionText>
              <MotionText 
                as="p" 
                className="mt-2 text-secondary"
                delay={0.5}
              >
                Selecione um ou mais idiomas para começar sua jornada
              </MotionText>
            </div>
            
            {errorMessage && (
              <MotionCard delay={0.2} className="bg-error bg-opacity-10 p-4">
                <MotionText as="p" className="text-sm text-error">
                  {errorMessage}
                </MotionText>
              </MotionCard>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {availableLanguages.map((language, index) => (
                  <motion.div
                    key={language.id}
                    onClick={() => toggleLanguage(language.id)}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 transition-all hover:shadow-md ${
                      selectedLanguages.includes(language.id)
                        ? `border-primary-color ${!isDarkMode ? 'bg-primary bg-opacity-5 shimmer' : 'bg-primary-hover bg-opacity-10 shimmer'}`
                        : 'border-border-color'
                    } ${!isDarkMode ? 'hover-float glass-light' : isDarkMode ? 'glass-dark' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: 0.5 + (index * 0.05),
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: `0px 8px 15px ${selectedLanguages.includes(language.id) ? 
                        isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(67, 97, 238, 0.25)' : 
                        isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className={`relative flex items-center justify-center w-16 h-16 rounded-full mb-2 ${
                        selectedLanguages.includes(language.id) ? 
                          !isDarkMode ? 'bg-gradient-to-r from-primary-color/20 to-accent-1/20' : 
                          'bg-gradient-to-r from-primary-color/20 to-accent-1/20' : 
                          'bg-transparent'
                      }`}
                    >
                      <motion.span 
                        className="text-4xl"
                        animate={{ 
                          rotate: selectedLanguages.includes(language.id) ? [0, -10, 10, -5, 5, 0] : 0,
                          scale: selectedLanguages.includes(language.id) ? [1, 1.2, 1] : 1,
                        }}
                        transition={{ 
                          duration: 0.5,
                          ease: "easeInOut"
                        }}
                      >
                        {language.flag}
                      </motion.span>
                      
                      {/* Efeito de seleção */}
                      {selectedLanguages.includes(language.id) && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-6 h-6 bg-primary-color rounded-full flex items-center justify-center text-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </motion.div>
                      )}
                    </motion.div>
                    
                    <span className="mt-1 text-sm font-medium">{language.name}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 flex justify-between">
                <MotionButton
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  variant="secondary"
                  delay={0.7}
                >
                  Pular
                </MotionButton>
                
                <MotionButton
                  type="submit"
                  disabled={loading || selectedLanguages.length === 0}
                  className={`${selectedLanguages.length === 0 ? 'opacity-70' : ''} ${selectedLanguages.length > 0 ? 'hover-glow' : ''}`}
                  delay={0.7}
                >
                  {loading ? 'Salvando...' : 'Começar a aprender'}
                </MotionButton>
              </div>
              
              {selectedLanguages.length > 0 && (
                <motion.div 
                  className="mt-4 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <MotionText as="p" className="text-sm text-secondary">
                    <span className="font-medium text-primary-color">{selectedLanguages.length}</span> {selectedLanguages.length === 1 ? 'idioma selecionado' : 'idiomas selecionados'}
                  </MotionText>
                </motion.div>
              )}
            </form>
          </MotionCard>
        </div>
      </AnimatedBackground>
    </PageTransition>
  );
} 