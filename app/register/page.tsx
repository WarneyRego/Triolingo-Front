'use client';

import Register from '@/components/auth/register';
import { useTheme } from '@/components/ui/theme-provider';

export default function RegisterPage() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  return <Register isDarkMode={isDarkMode} />;
} 