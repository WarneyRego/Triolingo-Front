'use client';

import React, { useState, useEffect } from 'react';
import { Lesson, LessonProgress, Exercise } from './LessonTypes';
import MultipleChoiceExercise from './MultipleChoiceExercise';
import TranslateExercise from './TranslateExercise';
import FillTheBlankExercise from './FillTheBlankExercise';
import { completeLesson } from '@/lib/firebase';
import MotionText from '@/components/ui/motion-text';
import MotionCard from '@/components/ui/motion-card';
import MotionButton from '@/components/ui/motion-button';
import { motion } from 'framer-motion';

interface LessonContainerProps {
  lesson: Lesson;
  onComplete?: (score: number, totalExercises: number) => void;
  isDarkMode?: boolean;
}

const LessonContainer: React.FC<LessonContainerProps> = ({ lesson, onComplete, isDarkMode = false }) => {
  // Estado para controlar o progresso da lição
  const [progress, setProgress] = useState<LessonProgress>({
    currentExerciseIndex: 0,
    score: 0,
    totalExercises: lesson.exercises.length,
    answeredCorrectly: Array(lesson.exercises.length).fill(false),
    isComplete: false
  });

  // Estado para controlar animações
  const [fadeIn, setFadeIn] = useState(true);
  const [currentExerciseKey, setCurrentExerciseKey] = useState<string>(
    `${lesson.id}-ex-${progress.currentExerciseIndex}`
  );
  
  // Estado para controlar a finalização da lição
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);

  // Exercício atual
  const currentExercise = lesson.exercises[progress.currentExerciseIndex];

  // Atualizar a chave do exercício quando o índice mudar
  useEffect(() => {
    setCurrentExerciseKey(`${lesson.id}-ex-${progress.currentExerciseIndex}`);
  }, [lesson.id, progress.currentExerciseIndex]);

  // Lidar com a resposta do usuário
  const handleAnswer = (isCorrect: boolean) => {
    // Iniciar animação de transição
    setFadeIn(false);
    
    // Aplicar um pequeno atraso para a animação
    setTimeout(() => {
      setProgress(prev => {
        // Copiar o array de respostas corretas
        const newAnsweredCorrectly = [...prev.answeredCorrectly];
        newAnsweredCorrectly[prev.currentExerciseIndex] = isCorrect;

        // Calcular novo score
        const newScore = newAnsweredCorrectly.filter(Boolean).length;
        
        // Verificar se é o último exercício
        const isLastExercise = prev.currentExerciseIndex === prev.totalExercises - 1;
        const isComplete = isLastExercise;

        return {
          ...prev,
          currentExerciseIndex: isLastExercise ? prev.currentExerciseIndex : prev.currentExerciseIndex + 1,
          score: newScore,
          answeredCorrectly: newAnsweredCorrectly,
          isComplete
        };
      });
      
      // Restaurar a animação de entrada após atualizar o exercício
      setTimeout(() => {
        setFadeIn(true);
      }, 100);
    }, 600);
  };

  // Função para finalizar a lição e salvar progresso no banco
  const handleFinishLesson = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Garantir que todos os valores sejam do tipo correto
      const lessonId = lesson.id;
      const language = lesson.language;
      const score = progress.score;
      const totalExercises = progress.totalExercises;
      
      console.log('Tentando finalizar lição com os dados:', {
        lessonId,
        language,
        score,
        totalExercises,
        scoreType: typeof score,
        totalExercisesType: typeof totalExercises
      });
      
      if (!lessonId || !language || typeof score !== 'number' || typeof totalExercises !== 'number') {
        throw new Error('Dados inválidos. Verifique se todos os campos são válidos.');
      }
      
      const result = await completeLesson(
        lessonId,
        language,
        score,
        totalExercises
      );
      
      console.log('Resultado da finalização da lição:', result);
      
      setSaveSuccess(true);
      // Usar o pointsGained retornado pela API, com fallback para diferença calculada ou score
      if (result && typeof result.pointsGained === 'number') {
        setPointsEarned(result.pointsGained);
      } else if (result && typeof result.points === 'number' && typeof result.previousPoints === 'number') {
        setPointsEarned(result.points - result.previousPoints);
      } else {
        // Fallback se a API não retornar os pontos ganhos
        setPointsEarned(score);
      }
      
      // Não redirecionar automaticamente, permitir que o usuário decida
    } catch (error) {
      console.error('Erro ao finalizar lição:', error);
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError('Ocorreu um erro ao salvar seu progresso');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Função para voltar ao dashboard manualmente
  const handleReturnToDashboard = () => {
    if (onComplete) {
      onComplete(progress.score, progress.totalExercises);
    }
  };

  // Renderizar o tipo apropriado de exercício
  const renderExercise = (exercise: Exercise) => {
    switch (exercise.type) {
      case 'multiple-choice':
        return (
          <MultipleChoiceExercise
            exercise={exercise}
            onAnswer={handleAnswer}
            isDarkMode={isDarkMode}
          />
        );
      case 'translate':
        return (
          <TranslateExercise
            exercise={exercise}
            onAnswer={handleAnswer}
            isDarkMode={isDarkMode}
          />
        );
      case 'fill-the-blank':
        return (
          <FillTheBlankExercise
            exercise={exercise}
            onAnswer={handleAnswer}
            isDarkMode={isDarkMode}
          />
        );
      default:
        return <div>Tipo de exercício não suportado</div>;
    }
  };

  // Barra de progresso
  const progressPercentage = ((progress.currentExerciseIndex) / progress.totalExercises) * 100;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6">
        <MotionText as="h2" className="text-2xl font-bold text-primary mb-2" delay={0.1}>
          {lesson.title}
        </MotionText>
        <MotionText as="p" className="text-secondary mb-4" delay={0.2}>
          {lesson.description}
        </MotionText>
        
        {/* Barra de progresso */}
        <motion.div 
          className="w-full bg-border-color rounded-full h-2.5"
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div 
            className="bg-primary-color h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </motion.div>
        <div className="flex justify-between text-sm text-secondary mt-1">
          <MotionText as="span" delay={0.4}>
            Exercício {progress.currentExerciseIndex + 1} de {progress.totalExercises}
          </MotionText>
          <MotionText as="span" delay={0.4}>
            Pontuação: {progress.score}
          </MotionText>
        </div>
      </div>

      {/* Área de exercícios com transição */}
      <motion.div 
        className="min-h-[400px] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <motion.div 
          key={currentExerciseKey}
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: fadeIn ? 1 : 0, 
            y: fadeIn ? 0 : 20 
          }}
          transition={{ duration: 0.5 }}
        >
          {!progress.isComplete ? (
            renderExercise(currentExercise)
          ) : (
            <MotionCard delay={0.1} className={`overflow-hidden rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <div className="relative">
                {/* Efeitos de confete para celebração */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div 
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {progress.score >= Math.ceil(progress.totalExercises * 0.6) && (
                      Array.from({ length: 50 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className={`absolute w-2 h-2 rounded-full ${
                            i % 3 === 0 ? 'bg-yellow-500' : i % 3 === 1 ? 'bg-green-500' : 'bg-primary-color'
                          }`}
                          initial={{ 
                            x: Math.random() * 500 - 250,
                            y: -20,
                            opacity: 1
                          }}
                          animate={{ 
                            y: 500,
                            opacity: 0
                          }}
                          transition={{ 
                            duration: 2 + Math.random() * 2,
                            delay: Math.random() * 0.5,
                            repeat: 1,
                            repeatDelay: 1
                          }}
                        />
                      ))
                    )}
                  </motion.div>
                </div>

                {/* Banner superior colorido */}
                <div className={`h-20 ${
                  progress.score >= Math.ceil(progress.totalExercises * 0.8) 
                    ? isDarkMode ? 'bg-gradient-to-r from-green-700 to-emerald-800' : 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : progress.score >= Math.ceil(progress.totalExercises * 0.6)
                      ? isDarkMode ? 'bg-gradient-to-r from-blue-700 to-indigo-800' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                      : isDarkMode ? 'bg-gradient-to-r from-amber-700 to-orange-800' : 'bg-gradient-to-r from-amber-500 to-orange-600'
                }`}></div>

                <div className={`p-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {/* Emblema/Medalha */}
                  <div className="flex justify-center -mt-16 mb-4">
                    <motion.div 
                      className={`flex items-center justify-center w-24 h-24 rounded-full shadow-lg ${
                        progress.score >= Math.ceil(progress.totalExercises * 0.8)
                          ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-700'
                          : progress.score >= Math.ceil(progress.totalExercises * 0.6)
                            ? isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'
                            : isDarkMode ? 'bg-amber-900 text-amber-200' : 'bg-amber-100 text-amber-700'
                      }`}
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 260, 
                        damping: 20,
                        delay: 0.3
                      }}
                    >
                      <span className="text-5xl">
                        {progress.score === progress.totalExercises 
                          ? '🏆' 
                          : progress.score >= Math.ceil(progress.totalExercises * 0.8)
                            ? '🎓'
                            : progress.score >= Math.ceil(progress.totalExercises * 0.6)
                              ? '🎯'
                              : '🔄'}
                      </span>
                    </motion.div>
                  </div>

                  <MotionText as="h3" className={`text-3xl font-bold text-center mb-2 ${
                    progress.score >= Math.ceil(progress.totalExercises * 0.8)
                      ? isDarkMode ? 'text-green-400' : 'text-green-600'
                      : progress.score >= Math.ceil(progress.totalExercises * 0.6)
                        ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        : isDarkMode ? 'text-amber-400' : 'text-amber-600'
                  }`} delay={0.2}>
                    {progress.score === progress.totalExercises
                      ? 'Perfeito!'
                      : progress.score >= Math.ceil(progress.totalExercises * 0.8)
                        ? 'Excelente!'
                        : progress.score >= Math.ceil(progress.totalExercises * 0.6)
                          ? 'Lição Concluída!'
                          : 'Quase lá!'}
                  </MotionText>

                  <div className="text-center mb-6">
                    <MotionText as="p" className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} delay={0.3}>
                      Você acertou <span className="font-bold">{progress.score}</span> de <span className="font-bold">{progress.totalExercises}</span> exercícios.
                    </MotionText>
                  </div>

                  {/* Barra de progresso de pontuação */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Pontuação</span>
                      <span className="font-medium">{Math.round((progress.score / progress.totalExercises) * 100)}%</span>
                    </div>
                    <div className={`w-full h-3 bg-gray-200 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <motion.div 
                        className={`h-3 rounded-full ${
                          progress.score >= Math.ceil(progress.totalExercises * 0.8)
                            ? isDarkMode ? 'bg-green-600' : 'bg-green-500'
                            : progress.score >= Math.ceil(progress.totalExercises * 0.6)
                              ? isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                              : isDarkMode ? 'bg-amber-600' : 'bg-amber-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress.score / progress.totalExercises) * 100}%` }}
                        transition={{ duration: 1, delay: 0.4 }}
                      ></motion.div>
                    </div>
                  </div>

                  {/* Mensagem de feedback baseada no desempenho */}
                  <div className="mb-8">
                    {progress.score >= Math.ceil(progress.totalExercises * 0.6) ? (
                      <MotionCard 
                        delay={0.5} 
                        className={`p-4 ${
                          isDarkMode 
                            ? 'bg-gray-700/50 border border-gray-600' 
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            progress.score === progress.totalExercises
                              ? isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-600'
                              : isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-600'
                          }`}>
                            {progress.score === progress.totalExercises ? '✨' : '✅'}
                          </div>
                          <div>
                            <MotionText as="p" className="font-medium" delay={0.6}>
                              {progress.score === progress.totalExercises
                                ? 'Uau! Você acertou todas as questões! Domínio completo do conteúdo!'
                                : progress.score >= Math.ceil(progress.totalExercises * 0.8)
                                  ? 'Ótimo trabalho! Você está dominando este assunto!'
                                  : 'Bom trabalho! Você completou esta lição com sucesso.'}
                            </MotionText>
                          </div>
                        </div>
                        
                        {saveSuccess ? (
                          <div className="mt-5 pl-12">
                            <div className="flex items-center mb-2">
                              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                                isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-600'
                              }`}>
                                ✓
                              </div>
                              <MotionText as="p" className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} delay={0.7}>
                                Seu progresso foi salvo!
                              </MotionText>
                            </div>
                            
                            <div className="flex items-center mb-4">
                              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                                isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-600'
                              }`}>
                                ⭐
                              </div>
                              <MotionText as="p" className="font-medium" delay={0.8}>
                                {pointsEarned > 0 
                                  ? `Pontos ganhos: +${pointsEarned}` 
                                  : 'Lição já completa anteriormente'}
                              </MotionText>
                            </div>
                            
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.9 }}
                              className="mt-4"
                            >
                              <MotionButton
                                onClick={handleReturnToDashboard}
                                className={`w-full py-3 ${
                                  isDarkMode 
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800' 
                                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                } text-white font-medium rounded-lg transition-all`}
                                delay={0.9}
                              >
                                <span className="flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Voltar ao Dashboard
                                </span>
                              </MotionButton>
                            </motion.div>
                          </div>
                        ) : saveError ? (
                          <div className="mt-5 pl-12">
                            <div className="flex items-start mb-3">
                              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5 ${
                                isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-600'
                              }`}>
                                !
                              </div>
                              <MotionText as="p" className={`font-medium ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} delay={0.7}>
                                {saveError}
                              </MotionText>
                            </div>
                            
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.8 }}
                            >
                              <MotionButton 
                                onClick={handleFinishLesson}
                                className={`w-full py-3 ${
                                  isDarkMode 
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                } font-medium rounded-lg transition-all`}
                                disabled={isSaving}
                                delay={0.8}
                              >
                                {isSaving ? 'Salvando...' : 'Tentar novamente'}
                              </MotionButton>
                            </motion.div>
                          </div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                            className="mt-5 pl-12"
                          >
                            <MotionButton
                              onClick={handleFinishLesson}
                              className={`w-full py-3 ${
                                isDarkMode 
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800' 
                                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                              } text-white font-medium rounded-lg transition-all`}
                              disabled={isSaving}
                              delay={0.7}
                            >
                              {isSaving ? (
                                <span className="flex items-center justify-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Salvando progresso...
                                </span>
                              ) : (
                                <span className="flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Finalizar e salvar progresso
                                </span>
                              )}
                            </MotionButton>
                          </motion.div>
                        )}
                      </MotionCard>
                    ) : (
                      <MotionCard 
                        delay={0.5} 
                        className={`p-4 ${
                          isDarkMode 
                            ? 'bg-gray-700/50 border border-gray-600' 
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            isDarkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-600'
                          }`}>
                            💪
                          </div>
                          <div>
                            <MotionText as="p" className="font-medium" delay={0.6}>
                              Você está quase lá! Continue praticando para melhorar seu desempenho.
                            </MotionText>
                            <MotionText as="p" className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} delay={0.7}>
                              É necessário acertar pelo menos {Math.ceil(progress.totalExercises * 0.6)} questões para concluir a lição.
                            </MotionText>
                          </div>
                        </div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.7 }}
                          className="mt-5 pl-12"
                        >
                          <MotionButton
                            onClick={() => window.location.reload()}
                            className={`w-full py-3 ${
                              isDarkMode 
                                ? 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800' 
                                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                            } text-white font-medium rounded-lg transition-all`}
                            delay={0.7}
                          >
                            <span className="flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                              </svg>
                              Tentar Novamente
                            </span>
                          </MotionButton>
                        </motion.div>
                      </MotionCard>
                    )}
                  </div>

                  {/* Botão adicional de tentar novamente quando já passou mas quer melhorar */}
                  {progress.score >= Math.ceil(progress.totalExercises * 0.6) && 
                   progress.score < progress.totalExercises && 
                   saveSuccess && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.0 }}
                      className="text-center"
                    >
                      <button 
                        onClick={() => window.location.reload()}
                        className={`text-sm ${
                          isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                        } underline transition-colors`}
                      >
                        Tentar novamente para melhorar sua pontuação
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </MotionCard>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LessonContainer; 