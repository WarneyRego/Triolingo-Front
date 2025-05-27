'use client';

import { useState, useEffect, useRef } from 'react';
import { getUserPoints, placeBet } from '@/lib/firebase';
import { RouletteColor } from '@/lib/types';
import { useTheme } from './theme-provider';
import MotionButton from './motion-button';
import MotionText from './motion-text';
import { motion, AnimatePresence } from 'framer-motion';

export function Roulette() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [userPoints, setUserPoints] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedColor, setSelectedColor] = useState<RouletteColor | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinDuration, setSpinDuration] = useState<number>(3);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const rouletteRef = useRef<HTMLDivElement>(null);

  // Buscar pontos do usuário
  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const points = await getUserPoints();
        setUserPoints(points);
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar pontos');
      }
    };

    fetchPoints();
  }, []);

  // Função para animar a roleta
  const animateRoulette = (resultColor: RouletteColor) => {
    if (!rouletteRef.current) return;
    
    // Gerar um número aleatório de rotações completas (entre 5 e 10)
    const rotations = 5 + Math.floor(Math.random() * 5);
    
    // Determinar a rotação final com base na cor do resultado
    // Vermelho: ângulo entre 0° e 180°, Preto: ângulo entre 180° e 360°
    const finalAngle = resultColor === 'red' 
      ? Math.random() * 180 
      : 180 + Math.random() * 180;
    
    // Calcular a rotação total (rotações completas + ângulo final)
    const totalRotation = rotations * 360 + finalAngle;
    
    // Aplicar a animação
    rouletteRef.current.style.transition = `transform ${spinDuration}s cubic-bezier(0.2, 0.8, 0.2, 1)`;
    rouletteRef.current.style.transform = `rotate(${totalRotation}deg)`;
  };

  // Função para fazer aposta
  const handleBet = async () => {
    if (!selectedColor) {
      setError('Selecione uma cor para apostar');
      return;
    }

    if (betAmount <= 0) {
      setError('O valor da aposta deve ser maior que zero');
      return;
    }

    if (betAmount > userPoints) {
      setError('Você não tem pontos suficientes para esta aposta');
      return;
    }

    setError(null);
    setIsSpinning(true);
    setResult(null);

    try {
      const betResult = await placeBet(selectedColor, betAmount);
      
      // Animar a roleta
      animateRoulette(betResult.resultColor);
      
      // Configurar timer para mostrar o resultado após a animação
      setTimeout(() => {
        setResult(betResult);
        setUserPoints(betResult.newTotal);
        setHistory([betResult, ...history].slice(0, 5)); // Manter apenas os últimos 5 resultados
        
        // Vibração para feedback tátil (em dispositivos que suportam)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          if (betResult.success) {
            // Padrão de vibração para vitória: 3 pulsos curtos
            navigator.vibrate([100, 50, 100, 50, 100]);
          } else {
            // Padrão de vibração para derrota: 1 pulso longo
            navigator.vibrate(300);
          }
        }
        
        if (betResult.success) {
          setShowConfetti(true);
          // Esconder confetti após alguns segundos
          setTimeout(() => setShowConfetti(false), 3000);
        }
        
        setIsSpinning(false);
      }, spinDuration * 1000);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar aposta');
      setIsSpinning(false);
    }
  };

  // Função para definir um valor de aposta
  const handleQuickBet = (percentage: number) => {
    const amount = Math.max(10, Math.floor(userPoints * (percentage / 100)));
    setBetAmount(amount);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      // Garantir que o valor esteja dentro dos limites
      const boundedValue = Math.min(Math.max(10, value), userPoints);
      setBetAmount(boundedValue);
    }
  };

  // Funções para incrementar e decrementar valores
  const decrementAmount = () => {
    // Decremento em passos de 1
    const newAmount = Math.max(10, betAmount - 1);
    setBetAmount(newAmount);
  };

  const incrementAmount = () => {
    // Incremento em passos de 1, respeitando o máximo
    const newAmount = Math.min(userPoints, betAmount + 1);
    setBetAmount(newAmount);
  };

  // Funções para incremento e decremento rápidos
  const decrementAmountFast = () => {
    // Decremento em passos de 10
    const newAmount = Math.max(10, betAmount - 10);
    setBetAmount(newAmount);
  };

  const incrementAmountFast = () => {
    // Incremento em passos de 10, respeitando o máximo
    const newAmount = Math.min(userPoints, betAmount + 10);
    setBetAmount(newAmount);
  };
  
  // Funções para duplicar e dividir o valor da aposta
  const doubleAmount = () => {
    const newAmount = Math.min(userPoints, betAmount * 2);
    setBetAmount(newAmount);
  };
  
  const halveAmount = () => {
    const newAmount = Math.max(10, Math.floor(betAmount / 2));
    setBetAmount(newAmount);
  };

  // Resetar posição da roleta quando o resultado é exibido
  useEffect(() => {
    if (!isSpinning && rouletteRef.current) {
      const timer = setTimeout(() => {
        if (rouletteRef.current) {
          rouletteRef.current.style.transition = 'none';
          rouletteRef.current.style.transform = 'rotate(0deg)';
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isSpinning]);

  return (
    <div className={`p-6 rounded-lg shadow-lg w-full max-w-md mx-auto ${
      isDarkMode 
        ? 'bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800' 
        : 'bg-gradient-to-b from-white to-gray-50 border border-gray-200'
    }`}>
      {/* Confetti para vitórias */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 100 }).map((_, i) => {
            const randomX = Math.random() * 100;
            const randomY = Math.random() * 100;
            const randomDelay = Math.random() * 2;
            const randomSize = 5 + Math.random() * 10;
            const randomColor = [
              'bg-red-500', 'bg-amber-400', 'bg-red-600', 
              'bg-amber-500', 'bg-red-400', 'bg-amber-300'
            ][Math.floor(Math.random() * 6)];
            
            return (
              <motion.div
                key={i}
                initial={{ y: -20, x: `${randomX}vw` }}
                animate={{ y: `${randomY}vh` }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  delay: randomDelay,
                  ease: "easeOut" 
                }}
                className={`absolute top-0 ${randomColor} rounded-full`}
                style={{ 
                  width: `${randomSize}px`, 
                  height: `${randomSize}px`,
                  opacity: 0.7
                }}
              />
            );
          })}
        </div>
      )}
      
      {/* Cabeçalho */}
      <div className="relative mb-6">
        <MotionText 
          as="h2" 
          className={`text-3xl font-bold mb-2 text-center ${
            isDarkMode 
              ? 'text-amber-300' 
              : 'text-red-700'
          }`}
        >
          Roleta de Apostas
        </MotionText>
        
        <motion.div 
          className="flex justify-center items-center gap-2 mb-4"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`h-3 w-3 rounded-full bg-red-600`}></div>
          <div className={`h-3 w-3 rounded-full bg-black`}></div>
          <div className={`h-3 w-3 rounded-full bg-red-600`}></div>
        </motion.div>
        
        <motion.div 
          className={`text-center px-4 py-3 rounded-lg ${
            isDarkMode 
              ? 'bg-gradient-to-r from-amber-800 to-amber-900 text-amber-100 border border-amber-700/30' 
              : 'bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-400/30'
          } shadow-md font-bold text-lg mb-4`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="opacity-80">Seus pontos:</span> {userPoints.toLocaleString('pt-BR')}
        </motion.div>
      </div>

      {/* Roleta visual */}
      <div className="mb-8 relative">
        <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -mt-3 w-4 h-8 ${
          isDarkMode ? 'bg-amber-500' : 'bg-red-600'
        } clip-triangle z-10`}></div>
        
        <div className={`relative w-72 h-72 rounded-full mx-auto shadow-xl overflow-hidden ${
          isDarkMode ? 'shadow-amber-900/20' : 'shadow-red-900/10'
        }`}>
          {/* Borda externa da roleta */}
          <div className={`absolute inset-0 rounded-full border-8 ${
            isDarkMode ? 'border-gray-800' : 'border-gray-200'
          } z-10`}></div>
          
          {/* Roda da roleta */}
          <div 
            ref={rouletteRef}
            className="absolute inset-0 rounded-full"
            style={{ transformOrigin: 'center center' }}
          >
            {/* Segmentos da roleta */}
            <div className="absolute w-full h-full">
              {/* Círculo vermelho */}
              <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                <span className="text-white font-bold text-xl ml-8">V</span>
              </div>
              
              {/* Círculo preto */}
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                <span className="text-white font-bold text-xl mr-8">P</span>
              </div>
            </div>
            
            {/* Linhas divisórias internas */}
            <div className="absolute inset-0 rounded-full flex justify-center items-center">
              <div className="w-0.5 h-full bg-white opacity-40"></div>
            </div>
            
            {/* Centro da roleta */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-12 h-12 rounded-full ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-amber-800 to-amber-900 border-4 border-gray-800' 
                  : 'bg-gradient-to-br from-red-500 to-red-600 border-4 border-gray-200'
              } z-20`}></div>
            </div>
          </div>
          
          {/* Indicador de resultado */}
          <AnimatePresence>
            {result && !isSpinning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className={`absolute inset-0 flex items-center justify-center rounded-full bg-opacity-80 z-30 ${
                  result.success 
                    ? 'bg-gradient-to-br from-green-500/90 to-emerald-600/90' 
                    : 'bg-gradient-to-br from-red-500/90 to-red-700/90'
                }`}
              >
                <div className="bg-white bg-opacity-90 rounded-lg px-6 py-4 text-center shadow-lg border border-gray-100">
                  <span className={`text-3xl font-bold ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                    {result.success ? 'GANHOU!' : 'PERDEU!'}
                  </span>
                  <div className="mt-1 text-lg font-medium text-gray-800">
                    {result.success 
                      ? `+${result.pointsWon} pontos` 
                      : `-${result.pointsLost} pontos`
                    }
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Seleção de cor */}
      <div className="mb-6">
        <h3 className={`text-lg font-medium mb-3 text-center ${
          isDarkMode ? 'text-amber-200' : 'text-red-700'
        }`}>Escolha sua cor</h3>
        <div className="flex justify-center space-x-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedColor('red')}
            className={`w-28 h-14 rounded-xl text-white font-bold transition-all duration-300 ${
              selectedColor === 'red' 
                ? 'bg-gradient-to-br from-red-500 to-red-700 ring-4 ring-red-400/50 shadow-lg scale-105' 
                : 'bg-gradient-to-br from-red-600 to-red-800 opacity-80'
            }`}
            disabled={isSpinning}
          >
            Vermelho
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedColor('black')}
            className={`w-28 h-14 rounded-xl text-white font-bold transition-all duration-300 ${
              selectedColor === 'black' 
                ? 'bg-gradient-to-br from-gray-700 to-black ring-4 ring-gray-500/50 shadow-lg scale-105' 
                : 'bg-gradient-to-br from-gray-800 to-black opacity-80'
            }`}
            disabled={isSpinning}
          >
            Preto
          </motion.button>
        </div>
      </div>

      {/* Valor da aposta */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className={`text-lg font-medium ${
            isDarkMode ? 'text-amber-200' : 'text-red-700'
          }`}>Valor da aposta</h3>
          <div className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>Máx: {userPoints}</div>
        </div>
        
        {/* Controles de apostas */}
        <div className="flex items-center mb-3">
          <div className="flex flex-col h-12 mr-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={decrementAmountFast}
              className={`h-6 w-7 flex items-center justify-center rounded-l-md rounded-tr-none text-xs font-bold ${
                isDarkMode 
                  ? `${betAmount <= 20 
                      ? 'bg-gray-800 text-gray-600' 
                      : 'bg-amber-900/80 text-amber-200 hover:bg-amber-800'
                    }` 
                  : `${betAmount <= 20 
                      ? 'bg-gray-100 text-gray-400' 
                      : 'bg-red-600/80 text-white hover:bg-red-500'
                    }`
              } transition-all duration-200`}
              disabled={isSpinning || betAmount <= 20}
              aria-label="Diminuir valor da aposta rapidamente"
              title="Diminuir valor da aposta em 10 pontos"
            >
              -10
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={incrementAmountFast}
              className={`h-6 w-7 flex items-center justify-center rounded-bl-md rounded-none text-xs font-bold ${
                isDarkMode 
                  ? `${betAmount >= userPoints - 9
                      ? 'bg-gray-800 text-gray-600' 
                      : 'bg-amber-900/80 text-amber-200 hover:bg-amber-800'
                    }` 
                  : `${betAmount >= userPoints - 9
                      ? 'bg-gray-100 text-gray-400' 
                      : 'bg-red-600/80 text-white hover:bg-red-500'
                    }`
              } transition-all duration-200`}
              disabled={isSpinning || betAmount >= userPoints - 9}
              aria-label="Aumentar valor da aposta rapidamente"
              title="Aumentar valor da aposta em 10 pontos"
            >
              +10
            </motion.button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={decrementAmount}
            className={`w-12 h-12 flex items-center justify-center rounded-l-xl font-bold text-xl ${
              isDarkMode 
                ? `${betAmount <= 10 
                    ? 'bg-gray-800 text-gray-600' 
                    : 'bg-amber-900 text-amber-200 hover:bg-amber-800'
                  }` 
                : `${betAmount <= 10 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'bg-red-600 text-white hover:bg-red-500'
                  }`
            } transition-all duration-200`}
            disabled={isSpinning || betAmount <= 10}
            aria-label="Diminuir valor da aposta"
            title="Diminuir valor da aposta em 1 ponto"
          >
            -
          </motion.button>
          
          <input
            type="number"
            value={betAmount}
            onChange={handleAmountChange}
            min="10"
            max={userPoints}
            step="1"
            className={`w-full h-12 text-center text-xl font-bold border-0 focus:outline-none focus:ring-2 ${
              isDarkMode 
                ? 'bg-gray-800 text-amber-200 focus:ring-amber-500' 
                : 'bg-gray-100 text-red-700 focus:ring-red-500'
            }`}
            disabled={isSpinning}
            onBlur={() => {
              // Validar valor ao perder o foco
              if (betAmount < 10) setBetAmount(10);
              if (betAmount > userPoints) setBetAmount(userPoints);
            }}
            aria-label="Valor da aposta"
            title="Valor da aposta"
          />
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={incrementAmount}
            className={`w-12 h-12 flex items-center justify-center rounded-r-xl font-bold text-xl ${
              isDarkMode 
                ? `${betAmount >= userPoints 
                    ? 'bg-gray-800 text-gray-600' 
                    : 'bg-amber-900 text-amber-200 hover:bg-amber-800'
                  }` 
                : `${betAmount >= userPoints 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'bg-red-600 text-white hover:bg-red-500'
                  }`
            } transition-all duration-200`}
            disabled={isSpinning || betAmount >= userPoints}
            aria-label="Aumentar valor da aposta"
            title="Aumentar valor da aposta em 1 ponto"
          >
            +
          </motion.button>
          
          <div className="flex flex-col h-12 ml-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={incrementAmountFast}
              className={`h-6 w-7 flex items-center justify-center rounded-tr-md rounded-none text-xs font-bold ${
                isDarkMode 
                  ? `${betAmount >= userPoints - 9
                      ? 'bg-gray-800 text-gray-600' 
                      : 'bg-amber-900/80 text-amber-200 hover:bg-amber-800'
                    }` 
                  : `${betAmount >= userPoints - 9
                      ? 'bg-gray-100 text-gray-400' 
                      : 'bg-red-600/80 text-white hover:bg-red-500'
                    }`
              } transition-all duration-200`}
              disabled={isSpinning || betAmount >= userPoints - 9}
              aria-label="Aumentar valor da aposta rapidamente"
              title="Aumentar valor da aposta em 10 pontos"
            >
              +10
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={decrementAmountFast}
              className={`h-6 w-7 flex items-center justify-center rounded-br-md rounded-none text-xs font-bold ${
                isDarkMode 
                  ? `${betAmount <= 20 
                      ? 'bg-gray-800 text-gray-600' 
                      : 'bg-amber-900/80 text-amber-200 hover:bg-amber-800'
                    }` 
                  : `${betAmount <= 20 
                      ? 'bg-gray-100 text-gray-400' 
                      : 'bg-red-600/80 text-white hover:bg-red-500'
                    }`
              } transition-all duration-200`}
              disabled={isSpinning || betAmount <= 20}
              aria-label="Diminuir valor da aposta rapidamente"
              title="Diminuir valor da aposta em 10 pontos"
            >
              -10
            </motion.button>
          </div>
        </div>
        
        {/* Apostas rápidas */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[10, 25, 50, 100].map((percent) => {
            // Calcular o valor da aposta para este percentual
            const percentValue = Math.max(10, Math.floor(userPoints * (percent / 100)));
            const isActive = betAmount === percentValue;
            
            return (
              <motion.button
                key={percent}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickBet(percent)}
                className={`py-1 rounded-md text-sm font-medium ${
                  isDarkMode 
                    ? isActive 
                      ? 'bg-amber-700 text-white' 
                      : 'bg-gray-800 text-amber-200 hover:bg-gray-700' 
                    : isActive 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-red-700 hover:bg-gray-300'
                } transition-all duration-200`}
                disabled={isSpinning}
                aria-label={`Apostar ${percent}% dos seus pontos`}
                title={`Apostar ${percent}% dos seus pontos (${percentValue} pontos)`}
              >
                <div className="flex flex-col items-center">
                  <span>{percent}%</span>
                  <span className="text-xs opacity-80">{percentValue}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
        
        {/* Controles adicionais */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={doubleAmount}
            className={`py-2 rounded-md text-sm font-medium ${
              isDarkMode 
                ? betAmount * 2 > userPoints
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white hover:opacity-90'
                : betAmount * 2 > userPoints
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90'
            } transition-all duration-200 flex items-center justify-center`}
            disabled={isSpinning || betAmount * 2 > userPoints}
            aria-label="Dobrar valor da aposta"
            title={`Dobrar valor da aposta (${Math.min(userPoints, betAmount * 2)} pontos)`}
          >
            <span className="mr-1">x2</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={halveAmount}
            className={`py-2 rounded-md text-sm font-medium ${
              isDarkMode 
                ? betAmount <= 10
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white hover:opacity-90'
                : betAmount <= 10
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90'
            } transition-all duration-200 flex items-center justify-center`}
            disabled={isSpinning || betAmount <= 10}
            aria-label="Reduzir valor da aposta pela metade"
            title={`Reduzir valor da aposta pela metade (${Math.max(10, Math.floor(betAmount / 2))} pontos)`}
          >
            <span className="mr-1">÷2</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16 10a1 1 0 01-1 1H5a1 1 0 110-2h10a1 1 0 011 1z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </div>
        
        <div className="flex justify-between">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setBetAmount(10)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              isDarkMode 
                ? betAmount === 10 
                  ? 'bg-amber-700 text-white' 
                  : 'bg-gray-800 text-amber-200 hover:bg-gray-700' 
                : betAmount === 10 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-red-700 hover:bg-gray-300'
            } transition-all duration-200`}
            disabled={isSpinning}
            aria-label="Apostar valor mínimo"
            title="Apostar valor mínimo (10 pontos)"
          >
            Mínimo
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setBetAmount(userPoints)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              isDarkMode 
                ? betAmount === userPoints 
                  ? 'bg-amber-700 text-white' 
                  : 'bg-gray-800 text-amber-200 hover:bg-gray-700' 
                : betAmount === userPoints 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-red-700 hover:bg-gray-300'
            } transition-all duration-200`}
            disabled={isSpinning}
            aria-label="Apostar todos os pontos"
            title={`Apostar todos os seus pontos (${userPoints} pontos)`}
          >
            Tudo
          </motion.button>
        </div>
      </div>

      {/* Botão de aposta */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleBet}
        disabled={isSpinning || !selectedColor || betAmount <= 0 || betAmount > userPoints}
        className={`w-full py-4 rounded-xl text-white font-bold text-xl mb-4 transition-all duration-300 ${
          isSpinning || !selectedColor || betAmount <= 0 || betAmount > userPoints
            ? 'bg-gray-500 cursor-not-allowed opacity-70'
            : isDarkMode
              ? 'bg-gradient-to-r from-amber-600 to-amber-800 shadow-lg hover:shadow-xl'
              : 'bg-gradient-to-r from-red-500 to-red-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {isSpinning ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin mr-2 h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
            Girando...
          </div>
        ) : (
          'Apostar e Girar'
        )}
      </motion.button>

      {/* Mensagem de erro */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center font-medium"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Histórico de apostas */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6"
        >
          <div className="flex items-center mb-3">
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-amber-200' : 'text-red-700'
            }`}>Histórico de apostas</h3>
            <div className={`ml-2 px-2 py-0.5 rounded-full ${
              isDarkMode 
                ? 'bg-amber-900/50 text-amber-200' 
                : 'bg-red-100 text-red-700'
            } text-xs font-medium`}>
              {history.length}
            </div>
          </div>
          
          <div className={`rounded-xl overflow-hidden shadow-md border ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-800' 
              : 'bg-white border-gray-200'
          }`}>
            {history.map((bet, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 flex justify-between items-center ${
                  index !== history.length - 1 ? `border-b ${
                    isDarkMode ? 'border-gray-800' : 'border-gray-100'
                  }` : ''
                } ${
                  index === 0 
                    ? bet.success 
                      ? isDarkMode 
                        ? 'bg-green-900/10' 
                        : 'bg-green-50'
                      : isDarkMode 
                        ? 'bg-red-900/10' 
                        : 'bg-red-50'
                    : ''
                }`}
              >
                <div className="flex items-center">
                  <div 
                    className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                      bet.resultColor === 'red' 
                        ? 'bg-gradient-to-br from-red-500 to-red-700 border border-red-400/20' 
                        : 'bg-gradient-to-br from-gray-700 to-black border border-gray-600/20'
                    }`} 
                  >
                    <span className="text-white text-xs font-bold">
                      {bet.resultColor === 'red' ? 'V' : 'P'}
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${
                      bet.success 
                        ? isDarkMode ? 'text-green-400' : 'text-green-600' 
                        : isDarkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {bet.success ? 'Ganhou' : 'Perdeu'}
                    </span>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Aposta: {bet.betColor === 'red' ? 'Vermelho' : 'Preto'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${
                    bet.success 
                      ? isDarkMode ? 'text-green-400' : 'text-green-600'
                      : isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {bet.success 
                      ? `+${bet.pointsWon}` 
                      : `-${bet.pointsLost}`
                    }
                  </span>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Total: {bet.newTotal}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Dicas */}
      <div className={`mt-6 p-3 rounded-lg text-sm border ${
        isDarkMode 
          ? 'bg-gray-800/50 text-amber-100/80 border-gray-700' 
          : 'bg-red-50 text-red-800/90 border-red-100'
      }`}>
        <p className="mb-1">
          <span className={`font-semibold ${
            isDarkMode ? 'text-amber-300' : 'text-red-700'
          }`}>Dica:</span> A probabilidade de ganhar é de 50%. Se você ganhar, recebe o dobro da sua aposta!
        </p>
      </div>
      
      {/* Estilo para triângulo indicador */}
      <style jsx>{`
        .clip-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>
    </div>
  );
} 