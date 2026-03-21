// components/Chatbot/ChatbotBubbles.tsx
'use client';

import { motion } from 'framer-motion';

// Valeurs fixes pour éviter les erreurs d'hydratation Next.js
// (Math.random() côté serveur ≠ côté client → crash)
const BUBBLES = [
  { w: 120, h: 120, left: 10,  top: 15,  dur: 14, sin: 0.84 },
  { w: 80,  h: 80,  left: 25,  top: 60,  dur: 18, sin: 0.91 },
  { w: 150, h: 150, left: 50,  top: 20,  dur: 12, sin: 0.14 },
  { w: 60,  h: 60,  left: 70,  top: 75,  dur: 20, sin: -0.76 },
  { w: 100, h: 100, left: 85,  top: 40,  dur: 16, sin: -0.96 },
  { w: 90,  h: 90,  left: 40,  top: 80,  dur: 22, sin: -0.28 },
  { w: 70,  h: 70,  left: 60,  top: 10,  dur: 15, sin: 0.66 },
  { w: 130, h: 130, left: 5,   top: 50,  dur: 19, sin: 0.99 },
];

const ChatbotBubbles = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {BUBBLES.map((b, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-gradient-to-br from-[#d12127]/10 to-[#d12127]/5"
        style={{ width: b.w, height: b.h, left: `${b.left}%`, top: `${b.top}%` }}
        animate={{
          y:      [0, -100, 0],
          x:      [0, b.sin * 50, 0],
          scale:  [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration:   b.dur,
          repeat:     Infinity,
          ease:       'linear',
          delay:      i * 0.5,
        }}
      />
    ))}
  </div>
);

export default ChatbotBubbles;