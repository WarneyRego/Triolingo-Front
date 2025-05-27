'use client';

import React, { useState } from 'react';
import { MultipleChoiceExercise as MultipleChoiceExerciseType } from './LessonTypes';

interface MultipleChoiceExerciseProps {
  exercise: MultipleChoiceExerciseType;
  onAnswer: (isCorrect: boolean) => void;
  isDarkMode?: boolean;
}

const MultipleChoiceExercise: React.FC<MultipleChoiceExerciseProps> = ({ 
  exercise, 
  onAnswer,
  isDarkMode = false 
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleOptionClick = (label: string) => {
    if (hasAnswered) return;
    setSelectedOption(label);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || hasAnswered) return;

    const option = exercise.options.find(opt => opt.label === selectedOption);
    const correct = option?.isCorrect || false;
    
    setIsCorrect(correct);
    setHasAnswered(true);
    
    // Delay para dar tempo ao usuário de ver o feedback antes de passar para o próximo exercício
    setTimeout(() => {
      onAnswer(correct);
    }, 1500);
  };

  return (
    <div className={`rounded-lg p-6 shadow-md ${isDarkMode ? 'bg-card-bg text-text-primary' : 'bg-white text-gray-800'}`}>
      <h3 className="text-xl font-semibold mb-4">{exercise.question}</h3>
      
      <div className="space-y-3 mb-6">
        {exercise.options.map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionClick(option.label)}
            className={`p-4 border rounded-lg cursor-pointer transition-colors
              ${selectedOption === option.label 
                ? isDarkMode ? 'border-green-500 bg-green-900/20' : 'border-green-500 bg-green-50' 
                : isDarkMode ? 'border-border-color hover:border-border-color/70' : 'border-gray-200 hover:border-gray-300'}
              ${hasAnswered && option.isCorrect 
                ? isDarkMode ? 'bg-green-900/30 border-green-500' : 'bg-green-100 border-green-500' 
                : ''}
              ${hasAnswered && selectedOption === option.label && !option.isCorrect 
                ? isDarkMode ? 'bg-red-900/30 border-red-500' : 'bg-red-100 border-red-500' 
                : ''}
            `}
          >
            <span className="font-medium">{option.label}</span>
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

export default MultipleChoiceExercise; 