"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
  isDarkMode?: boolean;
}

export default function AnimatedBackground({
  children,
  className = "",
  isDarkMode = false,
}: AnimatedBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", updateDimensions);
    
    // Inicializa as dimensões
    updateDimensions();
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Calcular posições relativas para os círculos adicionais
  const circle1X = dimensions.width * 0.2;
  const circle1Y = dimensions.height * 0.3;
  const circle2X = dimensions.width * 0.8;
  const circle2Y = dimensions.height * 0.7;

  // Configurações de animação baseadas no tema
  const lightThemeStyles = {
    main: `radial-gradient(800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(130, 170, 255, 0.15), transparent 80%)`,
    accent1: `radial-gradient(600px at ${circle1X}px ${circle1Y}px, rgba(255, 189, 89, 0.12), transparent 70%)`,
    accent2: `radial-gradient(700px at ${circle2X}px ${circle2Y}px, rgba(172, 182, 229, 0.14), transparent 70%)`,
    fixed1: "radial-gradient(1200px at 15% 90%, rgba(200, 230, 255, 0.25), transparent 80%)",
    fixed2: "radial-gradient(1000px at 80% 20%, rgba(230, 255, 214, 0.2), transparent 70%)",
    backgroundColor: "hsl(210, 40%, 98%)",
  };

  const darkThemeStyles = {
    main: `radial-gradient(800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.2), transparent 80%)`,
    accent1: `radial-gradient(600px at ${circle1X}px ${circle1Y}px, rgba(124, 58, 237, 0.12), transparent 70%)`,
    accent2: `radial-gradient(700px at ${circle2X}px ${circle2Y}px, rgba(79, 70, 229, 0.15), transparent 70%)`,
    fixed1: "radial-gradient(1200px at 15% 90%, rgba(30, 41, 59, 0.4), transparent 80%)",
    fixed2: "radial-gradient(1000px at 80% 20%, rgba(15, 23, 42, 0.5), transparent 70%)",
    backgroundColor: "#111827", // Cinza escuro azulado
    overlay: "linear-gradient(to bottom, rgba(15, 23, 42, 0.3), rgba(15, 23, 42, 0.5))"
  };

  const currentTheme = isDarkMode ? darkThemeStyles : lightThemeStyles;

  // Variantes para animações
  const mainGradientVariants = {
    default: {
      background: currentTheme.main,
    },
  };

  const breathingVariants = {
    initial: { scale: 1, opacity: 0.7 },
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 0.9, 0.7],
      transition: {
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [0, 20, 0, -20, 0],
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div 
      className={`relative w-full min-h-screen overflow-hidden ${className} ${isDarkMode ? 'animated-bg-dark' : ''}`}
      style={{ 
        backgroundColor: currentTheme.backgroundColor,
      }}
    >
      {/* Gradientes fixos */}
      <div 
        className="fixed inset-0 z-0" 
        style={{ background: currentTheme.fixed1 }} 
      />
      <div 
        className="fixed inset-0 z-0" 
        style={{ background: currentTheme.fixed2 }} 
      />
      
      {/* Overlay específico para tema escuro */}
      {isDarkMode && (
        <div 
          className="fixed inset-0 z-0 opacity-70" 
          style={{ 
            background: darkThemeStyles.overlay,
            mixBlendMode: "multiply"
          }} 
        />
      )}
      
      {/* Gradientes animados */}
      <motion.div
        className="fixed inset-0 z-1"
        animate="default"
        variants={mainGradientVariants}
        transition={{ type: "spring", damping: 15 }}
      />
      
      <motion.div
        className="fixed inset-0 z-1"
        initial="initial"
        animate="animate"
        variants={breathingVariants}
        style={{ background: currentTheme.accent1 }}
      />
      
      <motion.div
        className="fixed inset-0 z-1"
        initial="initial"
        animate="animate"
        variants={floatingVariants}
        style={{ background: currentTheme.accent2 }}
      />
      
      {/* Decoração sutil para tema claro */}
      {!isDarkMode && (
        <>
          <div className="fixed top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-50/40 to-transparent z-1 rounded-bl-[100%]" />
          <div className="fixed bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-amber-50/30 to-transparent z-1 rounded-tr-[100%]" />
        </>
      )}
      
      {/* Decoração sutil para tema escuro */}
      {isDarkMode && (
        <>
          <div className="fixed top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-indigo-900/10 to-transparent z-1 rounded-br-[100%]" />
          <div className="fixed bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-violet-900/10 to-transparent z-1 rounded-tl-[100%]" />
        </>
      )}
      
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
} 