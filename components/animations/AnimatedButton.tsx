'use client';

import { motion } from 'framer-motion';
import { HTMLMotionProps } from 'framer-motion';

interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children' | 'type'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'white';
  type?: 'button' | 'submit' | 'reset';
}

export default function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
  whileHover,
  whileTap,
  ...props
}: AnimatedButtonProps) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-white text-primary border-2 border-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'bg-transparent border-2 border-white text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed',
    white: 'bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${variants[variant]} ${className}`}
      whileHover={!disabled ? whileHover || { 
        scale: 1.05,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      } : undefined}
      whileTap={!disabled ? whileTap || { scale: 0.95 } : undefined}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}