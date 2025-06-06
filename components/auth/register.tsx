'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageTransition from '@/components/ui/page-transition';
import AnimatedBackground from '@/components/ui/animated-background';
import MotionText from '@/components/ui/motion-text';
import MotionCard from '@/components/ui/motion-card';
import MotionButton from '@/components/ui/motion-button';
import { useTheme } from '@/components/ui/theme-provider';

interface RegisterProps {
  isDarkMode?: boolean;
}

export default function Register({ isDarkMode: propIsDarkMode }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const { register, isAuthenticated, userLoading } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  // Use a propriedade se fornecida, caso contrário, use o valor do contexto
  const isDarkMode = propIsDarkMode !== undefined ? propIsDarkMode : theme === 'dark';
  
  // Marcar componente como montado para evitar erros de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (mounted && !userLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [mounted, userLoading, isAuthenticated, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validação básica
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('Por favor, preencha todos os campos');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem');
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    
    try {
      await register(email, password, name);
      // Redirecionar para a página de seleção de idiomas após o registro
      router.push('/language-selection');
    } catch (error) {
      // Mostrar mensagem de erro
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Ocorreu um erro ao registrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Não renderizar nada até que o componente esteja montado no cliente
  if (!mounted) {
    return null;
  }
  
  return (
    <PageTransition>
      <AnimatedBackground isDarkMode={isDarkMode}>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <MotionCard delay={0.2} className={`w-full max-w-md space-y-8 p-6 ${!isDarkMode ? 'glass-light' : 'glass-dark'}`}>
            <div className="text-center">
              <MotionText 
                as="h1" 
                className="text-3xl font-bold text-primary-color"
                delay={0.3}
                staggerChildren
              >
                Triolingo
              </MotionText>
              <MotionText 
                as="h2" 
                className="mt-2 text-2xl font-semibold text-primary"
                delay={0.4}
              >
                Criar uma nova conta
              </MotionText>
              <MotionText 
                as="p" 
                className="mt-2 text-secondary"
                delay={0.5}
              >
                Comece sua jornada de aprendizado
              </MotionText>
            </div>
            
            {errorMessage && (
              <MotionCard delay={0.2} className="bg-error bg-opacity-10 p-4">
                <MotionText as="p" className="text-sm text-error">
                  {errorMessage}
                </MotionText>
              </MotionCard>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4 rounded-md">
                <div>
                  <label htmlFor="name" className="sr-only">
                    Nome
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="relative block w-full appearance-none rounded-md border border-border-color px-3 py-2 text-primary placeholder-text-secondary focus:border-primary-color focus:outline-none focus:ring-primary-color sm:text-sm focus-effect"
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative block w-full appearance-none rounded-md border border-border-color px-3 py-2 text-primary placeholder-text-secondary focus:border-primary-color focus:outline-none focus:ring-primary-color sm:text-sm focus-effect"
                    placeholder="E-mail"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Senha
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative block w-full appearance-none rounded-md border border-border-color px-3 py-2 text-primary placeholder-text-secondary focus:border-primary-color focus:outline-none focus:ring-primary-color sm:text-sm focus-effect"
                    placeholder="Senha (mínimo 6 caracteres)"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="sr-only">
                    Confirmar Senha
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="relative block w-full appearance-none rounded-md border border-border-color px-3 py-2 text-primary placeholder-text-secondary focus:border-primary-color focus:outline-none focus:ring-primary-color sm:text-sm focus-effect"
                    placeholder="Confirmar senha"
                  />
                </div>
              </div>
              
              <div>
                <MotionButton
                  type="submit"
                  disabled={loading}
                  className="w-full justify-center"
                  delay={0.6}
                >
                  {loading ? 'Registrando...' : 'Registrar'}
                </MotionButton>
              </div>
              
              <div className="text-center text-sm">
                <MotionText as="p" className="text-secondary" delay={0.7}>
                  Já tem uma conta?{' '}
                  <Link href="/login" className="font-medium text-primary-color hover:text-primary-hover">
                    Entre aqui
                  </Link>
                </MotionText>
              </div>
            </form>
          </MotionCard>
        </div>
      </AnimatedBackground>
    </PageTransition>
  );
} 