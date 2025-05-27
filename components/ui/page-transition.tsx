"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({
  children,
  className = "",
}: PageTransitionProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    return () => setIsLoaded(false);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoaded && (
        <motion.div
          className={`w-full ${className}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: {
              duration: 0.4,
              ease: [0.45, 0, 0.55, 1],
            }
          }}
          exit={{ 
            opacity: 0,
            y: 20,
            transition: {
              duration: 0.3,
              ease: [0.45, 0, 0.55, 1],
            }
          }}
        >
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{
              scaleX: 0,
              transition: { 
                duration: 0.7, 
                ease: [0.83, 0, 0.17, 1] 
              },
              transformOrigin: "right"
            }}
            className="fixed inset-0 bg-primary-color z-50"
          />
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 