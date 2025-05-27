'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile, 
  updateUserLanguages,
  getUserLearningLanguages,
  ensureUserInFirestore,
  UserData 
} from '@/lib/firebase';

interface AuthContextType {
  user: UserData | null;
  userLoading: boolean;
  register: (email: string, password: string, name: string) => Promise<UserData>;
  login: (email: string, password: string) => Promise<UserData>;
  logout: () => Promise<void>;
  updateLanguages: (languages: string[]) => Promise<void>;
  error: string | null;
  isAuthenticated: boolean;
  ensureFirestoreDocument: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          const userData = await getUserProfile();
          
          // Buscar idiomas de aprendizado
          try {
            const learningLanguages = await getUserLearningLanguages();
            userData.targetLanguages = learningLanguages;
          } catch (langError) {
            console.error('Erro ao buscar idiomas de aprendizado:', langError);
          }
          
          setUser(userData);
          setIsAuthenticated(true);
          
          // Garantir que o usuário tenha um documento no Firestore
          try {
            await ensureUserInFirestore();
          } catch (firestoreError) {
            console.error('Erro ao verificar documento Firestore:', firestoreError);
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          localStorage.removeItem('auth_token');
        }
      }
      
      setUserLoading(false);
    };
    
    checkAuth();
  }, []);

  // Funções de autenticação
  const register = async (email: string, password: string, name: string) => {
    setError(null);
    try {
      const { user: userData } = await registerUser(email, password, name);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Garantir que o usuário tenha um documento no Firestore
      try {
        await ensureUserInFirestore();
      } catch (firestoreError) {
        console.error('Erro ao verificar documento Firestore após registro:', firestoreError);
      }
      
      return userData;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const { user: userData } = await loginUser(email, password);
      
      // Buscar idiomas de aprendizado após o login
      try {
        const learningLanguages = await getUserLearningLanguages();
        userData.targetLanguages = learningLanguages;
      } catch (langError) {
        console.error('Erro ao buscar idiomas de aprendizado após login:', langError);
      }
      
      setUser(userData);
      setIsAuthenticated(true);
      
      // Garantir que o usuário tenha um documento no Firestore
      try {
        await ensureUserInFirestore();
      } catch (firestoreError) {
        console.error('Erro ao verificar documento Firestore após login:', firestoreError);
      }
      
      return userData;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await logoutUser();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const updateLanguages = async (languages: string[]) => {
    setError(null);
    try {
      const response = await updateUserLanguages(languages);
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          targetLanguages: response.targetLanguages
        };
      });
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };
  
  // Função para garantir que o usuário tenha um documento no Firestore
  const ensureFirestoreDocument = async () => {
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }
    
    try {
      await ensureUserInFirestore();
    } catch (error) {
      console.error('Erro ao verificar documento Firestore:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userLoading, 
      register, 
      login, 
      logout, 
      updateLanguages, 
      error,
      isAuthenticated,
      ensureFirestoreDocument
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
} 