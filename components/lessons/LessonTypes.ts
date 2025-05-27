// Tipos para os exercícios e lições

// Opção para exercícios de múltipla escolha
export interface Option {
  label: string;
  isCorrect: boolean;
}

// Feedback para o usuário após resposta
export interface Feedback {
  correct: string;
  wrong: string;
}

// Interface base para todos os tipos de exercícios
export interface BaseExercise {
  id: string;
  type: string;
  question: string;
  feedback: Feedback;
}

// Exercício de múltipla escolha
export interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple-choice';
  options: Option[];
}

// Exercício de tradução
export interface TranslateExercise extends BaseExercise {
  type: 'translate';
  answer: string[];
}

// Exercício de preencher lacunas
export interface FillTheBlankExercise extends BaseExercise {
  type: 'fill-the-blank';
  sentence: string;
  options: string[];
  answer: string;
}

// União dos tipos de exercícios
export type Exercise = MultipleChoiceExercise | TranslateExercise | FillTheBlankExercise;

// Interface para a lição completa
export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: number;
  language: string;
  exercises: Exercise[];
}

// Estado do progresso do usuário na lição
export interface LessonProgress {
  currentExerciseIndex: number;
  score: number;
  totalExercises: number;
  answeredCorrectly: boolean[];
  isComplete: boolean;
} 