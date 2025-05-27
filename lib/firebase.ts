'use client';

// API para autenticação e gerenciamento de usuários do Triolingo

// API URL base
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-api-a65j.onrender.com';

// Tipo para usuário
export interface UserData {
  uid: string;
  email: string | null;
  name: string | null;
  targetLanguages?: string[];
  isOnline?: boolean;
  lastActive?: Date;
}

// Tipo para progresso da lição
export interface LessonProgressData {
  lessonId: string;
  language: string;
  score: number;
  totalExercises: number;
  completionPercentage: number;
  completed: boolean;
  completedAt?: string;
  lastUpdated: string;
  createdAt?: string;
}

// Tipo para estatísticas do usuário
export interface UserStats {
  completedLessons: number;
  totalCorrectAnswers: number;
  totalExercises: number;
  [language: string]: any;
}

// Tipo para resposta de conclusão de lição
export interface CompleteLessonResponse {
  message: string;
  progress: LessonProgressData;
  isCompleted: boolean;
  points: number;
  previousPoints?: number; // Pontuação anterior do usuário (opcional)
  pointsGained?: number; // Pontos ganhos nesta sessão (opcional)
  stats: UserStats;
}

// Tipo para progresso recente
export interface RecentProgressResponse {
  progress: LessonProgressData[];
}

// Tipo para item de ranking
export interface RankingItem {
  position: number;
  uid: string;
  name: string;
  points: number;
  stats?: UserStats;
  completedLessons?: number;
}

// Tipo para resposta de ranking geral
export interface GeneralRankingResponse {
  rankings: RankingItem[];
}

// Tipo para resposta de ranking por idioma
export interface LanguageRankingResponse {
  language: string;
  rankings: RankingItem[];
}

// Função para registro de usuário
export async function registerUser(email: string, password: string, name: string): Promise<{ user: UserData, token: string }> {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro no registro');
    }
    
    const data = await response.json();
    
    // Salvar token no localStorage
    localStorage.setItem('auth_token', data.token);
    
    return data;
  } catch (error) {
    console.error('Erro no registro:', error);
    throw error;
  }
}

// Função para login
export async function loginUser(email: string, password: string): Promise<{ user: UserData, token: string }> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro no login');
    }
    
    const data = await response.json();
    
    // Salvar token no localStorage
    localStorage.setItem('auth_token', data.token);
    
    return data;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
}

// Função para obter perfil do usuário
export async function getUserProfile(): Promise<UserData> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    const response = await fetch(`${API_URL}/api/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar perfil');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao obter perfil do usuário:', error);
    throw error;
  }
}

// Função para buscar idiomas de aprendizado do usuário
export async function getUserLearningLanguages(): Promise<string[]> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    const response = await fetch(`${API_URL}/api/user/learning-languages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar idiomas');
    }
    
    const data = await response.json();
    return data.targetLanguages || [];
  } catch (error) {
    console.error('Erro ao buscar idiomas de aprendizado:', error);
    throw error;
  }
}

// Função para finalizar uma lição
export async function completeLesson(
  lessonId: string, 
  language: string, 
  score: number, 
  totalExercises: number
): Promise<CompleteLessonResponse> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    const response = await fetch(`${API_URL}/api/lessons/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        lessonId, 
        language, 
        score, 
        totalExercises 
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao finalizar lição');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao finalizar lição:', error);
    throw error;
  }
}

// Função para atualizar idiomas-alvo do usuário
export async function updateUserLanguages(targetLanguages: string[]): Promise<{ message: string, targetLanguages: string[] }> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    const response = await fetch(`${API_URL}/api/user/languages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targetLanguages }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar idiomas');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar idiomas:', error);
    throw error;
  }
}

// Função para logout
export async function logoutUser(): Promise<void> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      try {
        // Tentar fazer logout na API
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (apiError) {
        console.error('Erro ao fazer logout na API:', apiError);
        // Continuar mesmo com erro na API
      }
    }
    
    // Remover token do localStorage independentemente da resposta da API
    localStorage.removeItem('auth_token');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
}

// Função para obter progresso recente das lições
export async function getRecentProgress(): Promise<RecentProgressResponse> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    const response = await fetch(`${API_URL}/api/lessons/recent-progress`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar progresso recente');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao obter progresso recente:', error);
    throw error;
  }
}

// Função para garantir que o usuário tem um documento no Firestore
export async function ensureUserInFirestore(): Promise<any> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    const response = await fetch(`${API_URL}/api/user/check-firestore`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao verificar documento Firestore');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao verificar documento Firestore:', error);
    throw error;
  }
}

// Função para obter ranking geral
export async function getGeneralRanking(limit = 10): Promise<GeneralRankingResponse> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    const response = await fetch(`${API_URL}/api/user/rankings/general?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar ranking geral');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao obter ranking geral:', error);
    throw error;
  }
}

// Função para obter ranking por idioma
export async function getLanguageRanking(language: string, limit = 10): Promise<LanguageRankingResponse> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    const response = await fetch(`${API_URL}/api/user/rankings/language/${language}?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar ranking por idioma');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao obter ranking para idioma ${language}:`, error);
    throw error;
  }
}

// Função para obter a quantidade de pontos do usuário
export async function getUserPoints(): Promise<number> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    const response = await fetch(`${API_URL}/api/user/points`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar pontos do usuário');
    }
    
    const data = await response.json();
    return data.points || 0;
  } catch (error) {
    console.error('Erro ao obter pontos do usuário:', error);
    throw error;
  }
}

// Função para fazer uma aposta na roleta
export async function placeBet(color: 'red' | 'black', amount: number): Promise<any> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    const response = await fetch(`${API_URL}/api/roulette/bet`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ color, amount }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao fazer aposta');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao fazer aposta:', error);
    throw error;
  }
} 