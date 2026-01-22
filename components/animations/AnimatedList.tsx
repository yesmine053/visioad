'use client';

import { motion } from 'framer-motion';

interface AnimatedListProps {
  items: string[];
  delay?: number;
  className?: string;
}

export default function AnimatedList({ 
  items, 
  delay = 0.1,
  className = '' 
}: AnimatedListProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: delay
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className={`space-y-3 ${className}`}
    >
      {items.map((text, index) => (
        <motion.div 
          key={index} 
          variants={item}
          className="flex items-center gap-3"
        >
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-700">{text}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}