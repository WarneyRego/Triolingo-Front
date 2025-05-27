'use client';

import React, { useState } from 'react';
import { TranslateExercise as TranslateExerciseType } from './LessonTypes';
import { filterOnlyLetters } from '@/lib/utils';

interface TranslateExerciseProps {
  exercise: TranslateExerciseType;
  onAnswer: (isCorrect: boolean) => void;
  isDarkMode?: boolean;
}

const TranslateExercise: React.FC<TranslateExerciseProps> = ({ 
  exercise, 
  onAnswer,
  isDarkMode = false 
}) => {
  const [answer, setAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasAnswered || !answer.trim()) return;

    // Filtrar a resposta do usuário para conter apenas letras, ignorando
    // acentos, espaços, pontuação e outros caracteres
    const userAnswer = filterOnlyLetters(answer.trim(), false, true);
    
    // Verificar se a resposta está correta comparando apenas as letras
    const isAnswerCorrect = exercise.answer.some(correctAnswer => {
      const filteredCorrectAnswer = filterOnlyLetters(correctAnswer, false, true);
      return filteredCorrectAnswer === userAnswer;
    });
    
    setIsCorrect(isAnswerCorrect);
    setHasAnswered(true);
    
    // Delay para dar tempo ao usuário de ver o feedback antes de passar para o próximo exercício
    setTimeout(() => {
      onAnswer(isAnswerCorrect);
    }, 1500);
  };

  return (
    <div className={`rounded-lg p-6 shadow-md ${isDarkMode ? 'bg-card-bg text-text-primary' : 'bg-white text-gray-800'}`}>
      <h3 className="text-xl font-semibold mb-4">{exercise.question}</h3>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={hasAnswered}
          placeholder="Digite sua resposta aqui"
          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2
            ${isDarkMode ? 'bg-neutral-800 text-text-primary placeholder-text-secondary border-border-color' : 'bg-white text-gray-800'}
            ${hasAnswered && isCorrect 
              ? isDarkMode ? 'border-green-500 focus:ring-green-700' : 'border-green-500 focus:ring-green-500' 
              : ''}
            ${hasAnswered && !isCorrect 
              ? isDarkMode ? 'border-red-500 focus:ring-red-700' : 'border-red-500 focus:ring-red-500' 
              : !hasAnswered 
                ? isDarkMode ? 'border-border-color focus:ring-primary-color' : 'border-gray-300 focus:ring-green-500'
                : ''}
          `}
        />
        
        <button
          type="submit"
          disabled={!answer.trim() || hasAnswered}
          className={`w-full mt-4 py-3 px-4 rounded-lg font-medium transition-colors
            ${!answer.trim() || hasAnswered
              ? isDarkMode ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isDarkMode ? 'bg-primary-color text-white hover:bg-primary-hover' : 'bg-green-600 text-white hover:bg-green-700'
            }
          `}
        >
          {hasAnswered ? 'Verificado' : 'Verificar'}
        </button>
      </form>
      
      {hasAnswered && (
        <div className={`p-4 rounded-lg ${isCorrect 
          ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800' 
          : isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}
        >
          {isCorrect ? exercise.feedback.correct : exercise.feedback.wrong}
          {!isCorrect && (
            <div className="mt-2 font-medium">
              Resposta correta: {exercise.answer[0]}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TranslateExercise; 