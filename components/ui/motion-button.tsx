"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MotionButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  delay?: number;
}

export default function MotionButton({
  children,
  variant = "primary",
  className = "",
  icon,
  onClick,
  disabled = false,
  type = "button",
  delay = 0,
}: MotionButtonProps) {
  const baseClass = variant === "primary" ? "btn-primary" : "btn-secondary";

  return (
    <motion.button
      className={`${baseClass} relative px-6 py-2 rounded-md flex items-center gap-2 ${className}`}
      whileHover={{ 
        y: -2,
        boxShadow: variant === "primary" 
          ? "0 10px 20px rgba(99, 102, 241, 0.4)" 
          : "0 10px 20px rgba(16, 185, 129, 0.4)" 
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay }}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {icon && (
        <motion.span
          initial={{ x: -5, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: delay + 0.1 }}
        >
          {icon}
        </motion.span>
      )}
      <span>{children}</span>
      <motion.div
        className="absolute -z-10 inset-0 rounded-md opacity-25"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: delay + 0.05 }}
      />
    </motion.button>
  );
} 