'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  once?: boolean;
  amount?: number;
}

export default function AnimatedSection({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  once = true,
  amount = 0.2
}: AnimatedSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  const directionMap = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 },
    none: { x: 0, y: 0 }
  };

  const initial = {
    opacity: 0,
    ...directionMap[direction]
  };

  const animate = isInView ? {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.6,
      delay,
      ease: [0.21, 0.47, 0.32, 0.98] as const // Ajout de 'as const'
    }
  } : initial;

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      className={className}
    >
      {children}
    </motion.div>
  );
}