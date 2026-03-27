'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from '@/components/animations/AnimatedButton';

const faqs = [
  {
    id: 1,
    question: 'Comment savoir quel service est adapté à mon entreprise ?',
    answer: 'Nous offrons une consultation gratuite pour aider à identifier les meilleurs services pour votre entreprise. Lors de la consultation, nous évaluerons vos besoins et recommanderons une approche personnalisée qui correspond à vos objectifs.'
  },
  {
    id: 2,
    question: 'Comment vos services de création de contenu aident-ils à améliorer la visibilité de ma marque ?',
    answer: 'Nos services de création de contenu améliorent la visibilité de votre marque en produisant des médias de haute qualité et engageants qui résonnent avec votre public et renforcent votre présence en ligne.'
  },
  {
    id: 3,
    question: 'Comment VISIOAD s\'assure-t-il que mes campagnes marketing sont efficaces ?',
    answer: 'VISIOAD garantit l\'efficacité des campagnes marketing grâce à des stratégies basées sur les données, un suivi continu des performances et une optimisation régulière pour maximiser les résultats et atteindre les objectifs commerciaux.'
  },
  {
    id: 4,
    question: 'VISIOAD peut-il aider à améliorer la réputation en ligne de mon entreprise ?',
    answer: 'Oui, VISIOAD peut aider à améliorer la réputation en ligne de votre entreprise grâce à la création de contenu stratégique, la gestion des avis, et l\'optimisation de votre présence en ligne pour renforcer la crédibilité et la confiance des clients.'
  },
  {
    id: 5,
    question: 'Quels sont les tarifs des services de VISIOAD ?',
    answer: 'Les tarifs des services de VISIOAD varient en fonction des besoins spécifiques de votre entreprise. Pour obtenir un devis personnalisé, veuillez nous contacter directement.'
  }
];

const FAQSection = () => {
  const [openId, setOpenId] = useState<number | null>(1);

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  const answerVariants = {
    hidden: { 
      height: 0,
      opacity: 0,
      paddingTop: 0,
      paddingBottom: 0
    },
    visible: { 
      height: 'auto',
      opacity: 1,
      paddingTop: '1rem',
      paddingBottom: '1rem',
      transition: {
        duration: 0.3,
        ease: 'easeInOut'as const
      }
    }
  };

  return (
    <section id="FAQ" className="py-12 md:py-20 bg-gradient-to-br from-gray-900 to-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Questions <span className="text-primary-300">fréquemment</span> posées
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="space-y-4"
          >
            {faqs.map((faq) => (
              <motion.div
                key={faq.id}
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-white/15 transition-colors duration-300"
              >
                <motion.button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center"
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg font-semibold text-white">{faq.question}</span>
                  <motion.svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: openId === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </motion.button>
                
                <AnimatePresence>
                  {openId === faq.id && (
                    <motion.div
                      variants={answerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="px-6 bg-white/5 border-t border-white/10 overflow-hidden"
                    >
                      <p className="text-gray-200 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-gray-300 mb-6">
              Vous avez d'autres questions ? Notre équipe est là pour vous aider.
            </p>
            <AnimatedButton 
              variant="white" 
              onClick={() => {
                document.getElementById('Contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Contactez-nous
            </AnimatedButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;