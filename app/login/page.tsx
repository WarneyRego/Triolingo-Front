'use client';

import Login from '@/components/auth/login';
import { useTheme } from '@/components/ui/theme-provider';

export default function LoginPage() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  return <Login isDarkMode={isDarkMode} />;
} 