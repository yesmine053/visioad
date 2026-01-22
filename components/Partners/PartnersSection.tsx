'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const partners = [
  {
    id: 1,
    name: 'Google',
    logo: '/images/partners/google.png',
    description: 'Offrir des services de qualité avec une expertise certifiée par Google.'
  },
  {
    id: 2,
    name: 'Meta',
    logo: '/images/partners/meta.png',
    description: 'Déverrouiller tout le potentiel du marketing sur Facebook et Instagram.'
  },
  {
    id: 3,
    name: 'Amazon Ads',
    logo: '/images/partners/amazon.png',
    description: 'Expert en génération de résultats avec la publicité Amazon.'
  },
  {
    id: 4,
    name: 'Microsoft',
    logo: '/images/partners/microsoft.png',
    description: 'Certifié pour des solutions publicitaires avancées de Microsoft'
  }
];

const PartnersSection = () => {
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
      scale: 0.9 
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
      y: -10,
      scale: 1.05,
      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: 0.3
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        type: 'spring' as const,
        stiffness: 200
      }
    },
    hover: {
      scale: 1.1,
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 0.6,
        times: [0, 0.25, 0.75, 1]
      }
    }
  };

  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-primary">Partenariats reconnus</span> dans l'industrie
        </motion.h2>
        
        <motion.p 
          className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Donner du pouvoir à votre entreprise avec le meilleur de l'industrie
        </motion.p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {partners.map((partner) => (
            <motion.div
              key={partner.id}
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Logo avec animation */}
              <motion.div 
                className="relative h-20 mb-6"
                variants={logoVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-contain"
                />
              </motion.div>
              
              <motion.h3 
                className="font-semibold text-gray-900 mb-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                {partner.name}
              </motion.h3>
              
              <motion.p 
                className="text-gray-600 text-sm"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                {partner.description}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersSection;