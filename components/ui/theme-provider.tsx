'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Definindo tipos
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  toggleThemeWithReload: () => void;
}

// Criando o contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook para usar o contexto
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}

// Props do Provider
interface ThemeProviderProps {
  children: ReactNode;
}

// Componente Provider
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Função para alternar o tema
  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      // Salva no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
      }
      return newTheme;
    });
  };
  
  // Função para alternar o tema e recarregar a página
  const toggleThemeWithReload = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    // Salva no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      
      // Aplica o tema ao documento para evitar flash
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // Recarregar a página após um pequeno delay para que o localStorage seja salvo
      setTimeout(() => {
        window.location.reload();
      }, 50);
    }
  };

  // Efeito para inicialização
  useEffect(() => {
    setMounted(true);
    
    // Verifica se há um tema salvo no localStorage
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    
    // Verifica a preferência de tema do sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Define o tema baseado na preferência salva ou do sistema
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  // Efeito para aplicar mudanças de tema
  useEffect(() => {
    if (!mounted) return;

    // Aplica o tema ao documento
    document.documentElement.setAttribute('data-theme', theme);
    
    // Aplica a classe de animação ao corpo
    if (theme === 'dark') {
      document.body.classList.remove('animated-bg-light');
      document.body.classList.add('animated-bg-dark');
    } else {
      document.body.classList.remove('animated-bg-dark');
      document.body.classList.add('animated-bg-light');
    }
  }, [theme, mounted]);

  // Não renderiza nada até o efeito de montagem ser executado
  // para evitar problemas de hidratação
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, toggleThemeWithReload }}>
      {children}
    </ThemeContext.Provider>
  );
} 