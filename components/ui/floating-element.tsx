"use client";

import { motion } from "framer-motion";
import { ReactNode, useState } from "react";

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  speed?: number;
}

export default function FloatingElement({
  children,
  className = "",
  strength = 20,
  speed = 0.3,
}: FloatingElementProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const posX = e.clientX - centerX;
    const posY = e.clientY - centerY;
    
    // Calculate rotation based on mouse position
    const rotateYValue = (posX / rect.width) * strength;
    const rotateXValue = (posY / rect.height) * -strength;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
    setScale(1.05);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };

  return (
    <motion.div
      className={`${className} cursor-pointer perspective-600`}
      animate={{
        rotateX,
        rotateY,
        scale,
        z: 10,
      }}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 200,
        duration: speed,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.div style={{ transform: "translateZ(20px)" }}>
        {children}
      </motion.div>
    </motion.div>
  );
} 