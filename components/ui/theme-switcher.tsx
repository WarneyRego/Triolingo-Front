'use client';

import { useTheme } from './theme-provider';
import { SunIcon, MoonIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';

export function ThemeSwitcher() {
  const { theme, toggleThemeWithReload } = useTheme();
  const isDarkMode = theme === 'dark';

  // Variantes de animação para o botão de tema
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.15,
      rotate: isDarkMode ? 15 : -15,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.9, 
      transition: { duration: 0.1 }
    }
  };

  // Variantes para o efeito de glow ao redor do botão
  const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    hover: { 
      opacity: 0.5, 
      scale: 1.4,
      transition: { duration: 0.3 }
    }
  };

  // Variantes para animação do ícone interno
  const iconVariants = {
    initial: { rotate: 0 },
    hover: { 
      rotate: isDarkMode ? [0, 15, 0, -15, 0] : [0, -15, 0, 15, 0],
      transition: { 
        repeat: Infinity, 
        duration: 1.5,
        repeatType: "loop" as const,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative">
      {/* Glow effect */}
      <motion.div 
        className={`absolute inset-0 rounded-full ${isDarkMode ? 'bg-violet-500/20' : 'bg-primary-color/20'}`}
        initial="initial"
        whileHover="hover"
        variants={glowVariants}
        style={{ filter: 'blur(8px)' }}
      />
      
      <motion.button
        onClick={toggleThemeWithReload}
        className={`flex items-center justify-center w-10 h-10 rounded-full z-10 relative theme-switch-btn 
          ${isDarkMode 
            ? 'bg-indigo-600/20 hover:bg-indigo-600/30' 
            : 'bg-primary-color/10 hover:bg-primary-color/20'
          }`}
        aria-label={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        variants={buttonVariants}
      >
        <motion.div 
          className="relative z-10"
          variants={iconVariants}
        >
          {isDarkMode ? (
            <SunIcon className="w-5 h-5 text-yellow-300 theme-icon-rotate" />
          ) : (
            <MoonIcon className="w-5 h-5 text-gray-800 theme-icon-rotate" />
          )}
        </motion.div>
        
        {/* Pulsing background effect */}
        <motion.div 
          className={`absolute inset-0 rounded-full ${isDarkMode ? 'bg-indigo-500/10' : 'bg-primary-color/10'}`}
          animate={{ 
            scale: [1, 1.1, 1], 
            opacity: [0.5, 0.8, 0.5] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatType: "reverse" as const,
            ease: "easeInOut"
          }}
        />
      </motion.button>
      
      {/* Label tooltip on hover */}
      <motion.div
        className={`absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-medium hidden md:block
          ${isDarkMode 
            ? 'bg-indigo-600 text-white' 
            : 'bg-primary-color text-white'
          }`}
        initial={{ opacity: 0, y: -5, scale: 0.9 }}
        whileHover={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {isDarkMode ? 'Tema claro' : 'Tema escuro'}
      </motion.div>
    </div>
  );
} 