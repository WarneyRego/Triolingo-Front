'use client';

import React, { useState } from 'react';
import { FillTheBlankExercise as FillTheBlankExerciseType } from './LessonTypes';
import { filterOnlyLetters } from '@/lib/utils';

interface FillTheBlankExerciseProps {
  exercise: FillTheBlankExerciseType;
  onAnswer: (isCorrect: boolean) => void;
  isDarkMode?: boolean;
}

const FillTheBlankExercise: React.FC<FillTheBlankExerciseProps> = ({ 
  exercise, 
  onAnswer,
  isDarkMode = false 
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleOptionClick = (option: string) => {
    if (hasAnswered) return;
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || hasAnswered) return;

    // Usando a função filterOnlyLetters para comparar apenas as letras
    const filteredSelected = filterOnlyLetters(selectedOption, false, true);
    const filteredAnswer = filterOnlyLetters(exercise.answer, false, true);
    
    const correct = filteredSelected === filteredAnswer;
    
    setIsCorrect(correct);
    setHasAnswered(true);
    
    // Delay para dar tempo ao usuário de ver o feedback antes de passar para o próximo exercício
    setTimeout(() => {
      onAnswer(correct);
    }, 1500);
  };

  // Função para renderizar a frase com o espaço em branco ou a resposta selecionada
  const renderSentence = () => {
    // Substituir o underscore pela opção selecionada ou por uma lacuna
    const parts = exercise.sentence.split('___');
    
    if (parts.length === 1) {
      // Se não houver ___ na string, assumimos que começa com ___
      return (
        <span>
          <span className={`font-bold px-1 py-0.5 rounded ${getBlankStyle()}`}>
            {selectedOption || '_____'}
          </span>
          {parts[0]}
        </span>
      );
    }
    
    if (parts.length === 2) {
      return (
        <span>
          {parts[0]}
          <span className={`font-bold px-1 py-0.5 rounded ${getBlankStyle()}`}>
            {selectedOption || '_____'}
          </span>
          {parts[1]}
        </span>
      );
    }
    
    // Caso tenha múltiplas lacunas (não suportado completamente nesta versão)
    return (
      <span>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className={`font-bold px-1 py-0.5 rounded ${getBlankStyle()}`}>
                {selectedOption || '_____'}
              </span>
            )}
          </React.Fragment>
        ))}
      </span>
    );
  };

  // Estilo para a lacuna baseado no estado da resposta
  const getBlankStyle = () => {
    if (!hasAnswered) {
      if (isDarkMode) {
        return selectedOption ? 'bg-blue-900/30 text-blue-300' : 'bg-neutral-700 text-neutral-300';
      } else {
        return selectedOption ? 'bg-blue-100' : 'bg-gray-100';
      }
    }
    if (isDarkMode) {
      return isCorrect ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300';
    } else {
      return isCorrect ? 'bg-green-100' : 'bg-red-100';
    }
  };

  return (
    <div className={`rounded-lg p-6 shadow-md ${isDarkMode ? 'bg-card-bg text-text-primary' : 'bg-white text-gray-800'}`}>
      <h3 className="text-xl font-semibold mb-4">{exercise.question}</h3>
      
      <div className="mb-6 text-lg">
        {renderSentence()}
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        {exercise.options.map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`p-3 border rounded-lg cursor-pointer text-center transition-colors
              ${selectedOption === option 
                ? isDarkMode ? 'border-green-500 bg-green-900/20' : 'border-green-500 bg-green-50' 
                : isDarkMode ? 'border-border-color hover:border-border-color/70' : 'border-gray-200 hover:border-gray-300'}
              ${hasAnswered && option === exercise.answer 
                ? isDarkMode ? 'bg-green-900/30 border-green-500' : 'bg-green-100 border-green-500' 
                : ''}
              ${hasAnswered && selectedOption === option && option !== exercise.answer 
                ? isDarkMode ? 'bg-red-900/30 border-red-500' : 'bg-red-100 border-red-500' 
                : ''}
            `}
          >
            <span className="font-medium">{option}</span>
          </div>
        ))}
      </div>
      
      {hasAnswered && (
        <div className={`p-4 rounded-lg mb-4 ${isCorrect 
          ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800' 
          : isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}
        >
          {isCorrect ? exercise.feedback.correct : exercise.feedback.wrong}
        </div>
      )}
      
      <button
        onClick={handleCheckAnswer}
        disabled={!selectedOption || hasAnswered}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors
          ${!selectedOption || hasAnswered
            ? isDarkMode ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : isDarkMode ? 'bg-primary-color text-white hover:bg-primary-hover' : 'bg-green-600 text-white hover:bg-green-700'
          }
        `}
      >
        {hasAnswered ? 'Verificado' : 'Verificar'}
      </button>
    </div>
  );
};

export default FillTheBlankExercise; 