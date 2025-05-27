"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MotionTextProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  delay?: number;
  staggerChildren?: boolean;
  direction?: "up" | "down" | "left" | "right";
}

export default function MotionText({
  children,
  className = "",
  as = "p",
  delay = 0,
  staggerChildren = false,
  direction = "up",
}: MotionTextProps) {
  // Defina a direção da animação
  const getDirection = () => {
    switch (direction) {
      case "up":
        return { y: 20 };
      case "down":
        return { y: -20 };
      case "left":
        return { x: 20 };
      case "right":
        return { x: -20 };
      default:
        return { y: 20 };
    }
  };

  // Componente para animar texto simples
  if (!staggerChildren) {
    const MotionTag = motion[as];
    return (
      <MotionTag
        className={className}
        initial={{ opacity: 0, ...getDirection() }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{
          duration: 0.5,
          delay,
          type: "spring",
          stiffness: 100,
          damping: 15,
        }}
      >
        {children}
      </MotionTag>
    );
  }

  // Componente para animar cada palavra sequencialmente
  const textContent = children?.toString() || "";
  const words = textContent.split(" ");
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay * i },
    }),
  };
  
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      ...getDirection(),
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const TagName = as;
  
  return (
    <motion.div
      className={`inline-flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="mr-1.5"
          variants={child}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
} 