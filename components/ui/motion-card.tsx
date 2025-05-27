"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function MotionCard({
  children,
  className = "",
  delay = 0,
}: MotionCardProps) {
  return (
    <motion.div
      className={`card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay,
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 10px 25px rgba(99, 102, 241, 0.25)",
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
} 