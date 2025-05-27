'use client';

import { Lesson } from '@/components/lessons/LessonTypes';

// API URL base
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Interface para o progresso da lição
export interface LessonProgressData {
  lessonId: string;
  language: string;
  score: number;
  totalExercises: number;
  completionPercentage: number;
  completed: boolean;
  lastUpdated: string;
  createdAt?: string;
}

/**
 * Salvar o progresso de uma lição
 * @param lessonId ID da lição
 * @param language Código do idioma
 * @param score Pontuação obtida
 * @param totalExercises Total de exercícios na lição
 * @param completed Se a lição foi concluída
 */
export async function saveLessonProgress(
  lessonId: string,
  language: string,
  score: number,
  totalExercises: number,
  completed: boolean = false
): Promise<LessonProgressData> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    const response = await fetch(`${API_URL}/api/lessons/progress`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lessonId,
        language,
        score,
        totalExercises,
        completed
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao salvar progresso');
    }
    
    const data = await response.json();
    return data.progress;
  } catch (error) {
    console.error('Erro ao salvar progresso da lição:', error);
    throw error;
  }
}

/**
 * Obter o progresso de todas as lições do usuário
 * @param language Opcional, filtrar por idioma
 */
export async function getLessonsProgress(language?: string): Promise<LessonProgressData[]> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    const url = new URL(`${API_URL}/api/lessons/progress`);
    if (language) {
      url.searchParams.append('language', language);
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao obter progresso');
    }
    
    const data = await response.json();
    return data.progress;
  } catch (error) {
    console.error('Erro ao obter progresso das lições:', error);
    throw error;
  }
}

/**
 * Obter o progresso de uma lição específica
 * @param lessonId ID da lição
 * @param language Código do idioma
 */
export async function getLessonProgress(lessonId: string, language: string): Promise<LessonProgressData | null> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    const url = new URL(`${API_URL}/api/lessons/progress/${lessonId}`);
    url.searchParams.append('language', language);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao obter progresso');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao obter progresso da lição:', error);
    throw error;
  }
}

/**
 * Carregar dados de uma lição específica
 * @param lessonId ID da lição
 * @param language Código do idioma
 */
export async function loadLesson(lessonId: string, language: string): Promise<Lesson> {
  try {
    console.log(`Carregando lição ${lessonId} para o idioma ${language}`);
    
    // Carregar o arquivo JSON da pasta public/data
    const response = await fetch(`/data/lesson1-${language}.json`);
    
    if (!response.ok) {
      console.error(`Erro ao carregar lição: ${response.status} ${response.statusText}`);
      throw new Error(`Erro ao carregar lição: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Lição carregada com sucesso: ${Object.keys(data).join(', ')}`);
    
    // Verificar se o formato contém a propriedade 'lessons'
    if (data.lessons && Array.isArray(data.lessons)) {
      // Encontrar a lição específica pelo ID
      const lesson = data.lessons.find((l: any) => l.id === lessonId);
      
      if (!lesson) {
        throw new Error(`Lição ${lessonId} não encontrada para o idioma ${language}`);
      }
      
      return lesson;
    }
    
    // Formato antigo: apenas uma lição
    return data;
  } catch (error) {
    console.error('Erro ao carregar lição:', error);
    throw new Error(`Não foi possível carregar a lição ${lessonId} para o idioma ${language}`);
  }
} 