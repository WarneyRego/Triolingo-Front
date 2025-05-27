'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from './theme-provider';
import { ThemeSwitcher } from './theme-switcher';
import MotionText from './motion-text';
import MotionButton from './motion-button';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface NavbarProps {
  user?: {
    name?: string;
  };
  onLogout?: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
        mass: 1
      }
    }
  };

  const logoVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };

  const linkVariants = {
    initial: { y: 0 },
    hover: { 
      y: -2,
      transition: { duration: 0.2 }
    }
  };

  // Decorative elements animation variants
  const decorativeElementVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { 
      opacity: isDarkMode ? 0.15 : 0.1, 
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  // Link hover animation
  const linkHoverVariants = {
    initial: { width: 0 },
    hover: { 
      width: '100%',
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  // Hover glow effect
  const navButtonHoverEffect = {
    rest: { boxShadow: "0 0 0 rgba(99, 102, 241, 0)" },
    hover: { 
      boxShadow: isDarkMode 
        ? "0 0 15px rgba(99, 102, 241, 0.5)" 
        : "0 0 10px rgba(67, 97, 238, 0.3)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.header 
      className={`sticky top-0 z-50 ${isDarkMode ? 'dashboard-header' : 'light-header'} shadow-md backdrop-blur-sm relative overflow-hidden`}
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
    >
      {/* Decorative elements - Different for each theme */}
      {isDarkMode ? (
        // Dark theme decorative elements
        <>
          <motion.div 
            className="absolute top-0 right-0 w-[30%] h-full bg-gradient-to-l from-indigo-600/5 to-transparent" 
            initial="initial"
            animate="animate"
            variants={decorativeElementVariants}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-[25%] h-[3px] bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <motion.div 
            className="absolute top-[40%] left-[10%] w-2 h-2 rounded-full bg-indigo-400/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.div 
            className="absolute top-[30%] right-[20%] w-3 h-3 rounded-full bg-violet-400/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
          />
        </>
      ) : (
        // Light theme decorative elements
        <>
          <motion.div 
            className="absolute top-0 left-0 w-[25%] h-full bg-gradient-to-r from-blue-500/5 to-transparent" 
            initial="initial"
            animate="animate"
            variants={decorativeElementVariants}
          />
          <motion.div 
            className="absolute bottom-0 right-0 w-[40%] h-[2px] bg-gradient-to-l from-transparent via-primary-color/20 to-transparent"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <motion.div 
            className="absolute top-[40%] right-[15%] w-2 h-2 rounded-full bg-primary-color/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.div 
            className="absolute top-[60%] left-[25%] w-1.5 h-1.5 rounded-full bg-accent-1/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 2.5, delay: 0.3, repeat: Infinity, repeatType: "reverse" }}
          />
        </>
      )}

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <motion.div
            variants={logoVariants}
            initial="initial"
            whileHover="hover"
            className="flex items-center"
          >
            <Link href="/dashboard" className="flex items-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${isDarkMode ? 'bg-white/10' : 'bg-primary-color/10'}`}>
                <motion.span 
                  className="text-2xl"
                  role="img" 
                  aria-label="logo"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                >
                  🌍
                </motion.span>
              </div>
              <MotionText 
                as="h1" 
                className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-primary-color'}`}
                staggerChildren
              >
                Triolingo
              </MotionText>
            </Link>
          </motion.div>

          <div className="flex items-center gap-5">
            <ThemeSwitcher />

            {user && (
              <div className="flex items-center gap-4">
                <motion.div 
                  className={`py-1 px-3 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-primary-color/10'}`}
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-primary-color'}`}>
                    Olá, {user?.name || 'Usuário'}
                  </span>
                </motion.div>
                
                {onLogout && (
                  <motion.div
                    initial="rest"
                    whileHover="hover"
                    variants={navButtonHoverEffect}
                  >
                    <MotionButton
                      onClick={onLogout}
                      className={`${isDarkMode 
                        ? '!bg-white !text-primary-color hover:!bg-white/90' 
                        : '!bg-primary-color !text-white hover:!bg-primary-hover'
                      } !px-4 !py-1.5 rounded-md shadow-sm`}
                    >
                      Sair
                    </MotionButton>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
} 