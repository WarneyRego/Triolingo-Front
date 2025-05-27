'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Roulette } from '@/components/ui/roulette';
import { useTheme } from '@/components/ui/theme-provider';
import PageTransition from '@/components/ui/page-transition';
import AnimatedBackground from '@/components/ui/animated-background';
import MotionText from '@/components/ui/motion-text';
import MotionButton from '@/components/ui/motion-button';
import Navbar from '@/components/ui/navbar';
import BetDialog from '@/components/ui/bet-dialog';
import { motion } from 'framer-motion';

export default function RoulettePage() {
  const { user, userLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [showBetDialog, setShowBetDialog] = useState(false);

  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [userLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleBackClick = () => {
    setShowBetDialog(true);
  };

  const handleCloseDialog = () => {
    setShowBetDialog(false);
  };

  const handleConfirmBack = () => {
    setShowBetDialog(false);
    router.push('/dashboard');
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

          <div className={`absolute top-0 w-full h-64 ${isDarkMode ? 'bg-gradient-to-b from-red-900/20 to-transparent' : 'bg-gradient-to-b from-red-500/10 to-transparent'} z-0`}></div>

          <main className="relative z-10 mx-auto max-w-7xl p-4 py-6">
            {/* Decoração de topo */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-4 opacity-50">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
            </div>

            <section>
              <div className="flex items-center mb-8">
                <MotionButton
                  onClick={handleBackClick}
                  className={`mr-4 ${
                    isDarkMode 
                      ? '!bg-gray-800/80 !text-red-200 hover:!bg-gray-700/80 border border-gray-700' 
                      : '!bg-white/90 !text-red-700 hover:!bg-white border border-gray-200'
                  } !px-4 !py-2 rounded-xl transition-colors duration-200 shadow-md`}
                >
                  ← Voltar
                </MotionButton>
                <div>
                  <h2 className={`text-3xl font-bold ${
                    isDarkMode ? 'text-gold-gradient' : 'text-red-gradient'
                  }`}>
                    Roleta de Apostas
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-amber-200/70' : 'text-red-700/70'}`}>
                    Aposte seus pontos e multiplique suas recompensas
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <motion.div 
                  className={`lg:col-span-2 ${
                    isDarkMode 
                      ? 'bg-gray-900/80 border border-gray-800 shadow-[0_0_15px_rgba(0,0,0,0.2)]' 
                      : 'bg-white/90 border border-gray-200 shadow-[0_0_15px_rgba(0,0,0,0.1)]'
                  } rounded-xl p-6 backdrop-blur-sm`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Roulette />
                </motion.div>
                
                <motion.div 
                  className={`${
                    isDarkMode 
                      ? 'bg-gray-900/80 border border-gray-800 shadow-[0_0_15px_rgba(0,0,0,0.2)]' 
                      : 'bg-white/90 border border-gray-200 shadow-[0_0_15px_rgba(0,0,0,0.1)]'
                  } rounded-xl p-6 backdrop-blur-sm`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-xl font-bold mb-4 ${
                        isDarkMode 
                          ? 'text-amber-300' 
                          : 'text-red-700'
                      }`}>
                        Como jogar
                      </h3>
                      <div className={`rounded-lg ${
                        isDarkMode 
                          ? 'bg-gray-800/80 border border-gray-700' 
                          : 'bg-gray-50/80 border border-gray-200'
                      } p-4`}>
                        <ol className="list-decimal list-inside space-y-3">
                          <li className="flex items-start">
                            <span className={`text-xl font-bold mr-3 ${
                              isDarkMode ? 'text-amber-400' : 'text-red-600'
                            }`}>1.</span>
                            <div>
                              <p className={`font-medium ${
                                isDarkMode ? 'text-amber-100' : 'text-gray-900'
                              }`}>Escolha uma cor</p>
                              <p className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                Selecione vermelho ou preto para sua aposta
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <span className={`text-xl font-bold mr-3 ${
                              isDarkMode ? 'text-amber-400' : 'text-red-600'
                            }`}>2.</span>
                            <div>
                              <p className={`font-medium ${
                                isDarkMode ? 'text-amber-100' : 'text-gray-900'
                              }`}>Defina o valor da aposta</p>
                              <p className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                Escolha quantos pontos deseja apostar
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <span className={`text-xl font-bold mr-3 ${
                              isDarkMode ? 'text-amber-400' : 'text-red-600'
                            }`}>3.</span>
                            <div>
                              <p className={`font-medium ${
                                isDarkMode ? 'text-amber-100' : 'text-gray-900'
                              }`}>Gire a roleta</p>
                              <p className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                Clique em "Apostar e Girar" e torça
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <span className={`text-xl font-bold mr-3 ${
                              isDarkMode ? 'text-amber-400' : 'text-red-600'
                            }`}>4.</span>
                            <div>
                              <p className={`font-medium ${
                                isDarkMode ? 'text-amber-100' : 'text-gray-900'
                              }`}>Receba suas recompensas</p>
                              <p className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                Se a roleta parar na sua cor, você ganha o dobro!
                              </p>
                            </div>
                          </li>
                        </ol>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className={`text-xl font-bold mb-4 ${
                        isDarkMode 
                          ? 'text-amber-300' 
                          : 'text-red-700'
                      }`}>
                        Regras
                      </h3>
                      <div className={`space-y-3 ${
                        isDarkMode ? 'text-amber-100' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            isDarkMode ? 'bg-amber-400' : 'bg-red-600'
                          }`}></div>
                          <p>Aposta mínima: 10 pontos</p>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            isDarkMode ? 'bg-amber-400' : 'bg-red-600'
                          }`}></div>
                          <p>Aposta máxima: Todos os seus pontos</p>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            isDarkMode ? 'bg-amber-400' : 'bg-red-600'
                          }`}></div>
                          <p>Probabilidade: 50% para cada cor</p>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            isDarkMode ? 'bg-amber-400' : 'bg-red-600'
                          }`}></div>
                          <p>Prêmio: 2x o valor apostado</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-amber-900/30 to-amber-800/30 border border-amber-800/30 text-amber-200' 
                        : 'bg-gradient-to-r from-red-50 to-amber-50 border border-amber-200 text-amber-900'
                    }`}>
                      <div className="flex">
                        <div className="mr-3 text-2xl">💎</div>
                        <div>
                          <p className={`font-medium ${
                            isDarkMode ? 'text-amber-300' : 'text-red-700'
                          }`}>Dica de apostador</p>
                          <p className="text-sm">Experimente apostar pequenas quantidades primeiro para se acostumar com o jogo!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Decoração de fundo */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
              </div>
            </section>
          </main>
        </div>

        {/* Diálogo de confirmação */}
        <BetDialog 
          isOpen={showBetDialog} 
          onClose={handleCloseDialog} 
          onConfirm={handleConfirmBack} 
        />

        {/* Estilos globais */}
        <style jsx global>{`
          .text-gold-gradient {
            background: linear-gradient(to right, #e6b980, #eacda3);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-fill-color: transparent;
          }
          
          .text-red-gradient {
            background: linear-gradient(to right, #cb2d3e, #ef473a);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-fill-color: transparent;
          }
        `}</style>
      </AnimatedBackground>
    </PageTransition>
  );
} 