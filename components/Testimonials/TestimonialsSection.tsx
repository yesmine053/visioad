'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    name: 'Sophie Lambert',
    role: 'Directeur du marketing',
    content: 'Grâce à VISIOAD, notre entreprise a connu un essor significatif de sa présence en ligne grâce à leurs campagnes digitales ciblées.',
    image: '/images/testimonials/sophie.png',
    rating: 5
  },
  {
    id: 2,
    name: 'Lucas Martin',
    role: 'Responsable de la marque',
    content: 'VISIOAD a conçu notre site avec un design soigné et une expérience optimale, renforçant notre présence en ligne.',
    image: '/images/testimonials/lucas.png',
    rating: 5
  },
  {
    id: 3,
    name: 'David Carter',
    role: 'Responsable de la stratégie',
    content: 'De la conception au marketing, l\'expertise et la stratégie de VISIOAD ont renforcé notre succès numérique.',
    image: '/images/testimonials/david.png',
    rating: 5
  },
  {
    id: 4,
    name: 'Ethan Parker',
    role: 'PDG',
    content: 'Collaborer avec VISIOAD a été une décision clé pour notre entreprise. Leur équipe a fourni des stratégies marketing exceptionnelles.',
    image: '/images/testimonials/ethan.png',
    rating: 5
  }
];

const TestimonialsSection = () => {
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

  const cardVariants = {
    hidden: { 
      y: 30, 
      opacity: 0,
      scale: 0.95 
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: 'spring' as const,
        stiffness: 100
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <section id="temoignages" className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Ce que disent nos Clients
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={cardVariants}
              whileHover="hover"
              className="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:border-primary/20 transition-all duration-300"
            >
              {/* Rating avec animation */}
              <motion.div 
                className="flex mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: testimonial.id * 0.1 }}
              >
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.svg 
                    key={i} 
                    className="w-5 h-5 text-yellow-500"
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </motion.svg>
                ))}
              </motion.div>

              {/* Content avec animation de texte */}
              <motion.blockquote 
                className="text-lg text-gray-700 mb-6 italic"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                "{testimonial.content}"
              </motion.blockquote>

              {/* Author avec animation */}
              <motion.div 
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <motion.div 
                  className="relative w-12 h-12 rounded-full overflow-hidden"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
                </motion.div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;