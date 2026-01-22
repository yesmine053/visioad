'use client';

import { motion } from 'framer-motion';
import Image, { ImageProps } from 'next/image';

interface AnimatedImageProps extends Omit<ImageProps, 'ref'> {
  delay?: number;
  scale?: number;
  className?: string;
}

export default function AnimatedImage({
  delay = 0,
  scale = 1,
  className = '',
  ...props
}: AnimatedImageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ 
        opacity: 1, 
        scale: 1,
        transition: {
          duration: 0.8,
          delay,
          ease: [0.21, 0.47, 0.32, 0.98]
        }
      }}
      viewport={{ once: true, amount: 0.3 }}
      className={`relative overflow-hidden ${className}`}
      whileHover={{ 
        scale: scale,
        transition: { duration: 0.3 }
      }}
    >
      <Image {...props} />
    </motion.div>
  );
}