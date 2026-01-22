'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import AnimatedImage from '@/components/animations/AnimatedImage';
import AnimatedButton from '@/components/animations/AnimatedButton';

const services = [
  {
    id: 1,
    title: 'Marketing Digital',
    description: 'Nos services de marketing digital sont conçus pour améliorer votre présence en ligne et engager efficacement votre audience.',
    image: '/images/marketing.png',
    icon: '/icons/marketing.svg',
    details: 'Stratégies SEO, publicité en ligne, médias sociaux, email marketing et analytics.'
  },
  {
    id: 2,
    title: 'Création de contenu et production multimédia',
    description: 'Nous livrons du contenu de haute qualité et une production médiatique conçue pour raconter l\'histoire de votre marque.',
    image: '/images/creation-de-contenu.png',
    icon: '/icons/content.svg',
    details: 'Photographie professionnelle, vidéographie, infographie et rédaction de contenu.'
  },
  {
    id: 3,
    title: 'Services de design',
    description: 'Élevez votre marque avec des designs créatifs et fonctionnels, alliant innovation et praticité pour réussir.',
    image: '/images/design.png',
    icon: '/icons/design.svg',
    details: 'Design UI/UX, identité visuelle, maquettes web et applications mobiles.'
  },
  {
    id: 4,
    title: 'Développement web et application',
    description: 'Création de sites web et d\'applications responsives conçus pour offrir des expériences utilisateur fluides et générer des résultats.',
    image: '/images/development.png',
    icon: '/icons/development.svg',
    details: 'Sites vitrines, e-commerce, applications web et mobiles, intégration API.'
  },
  {
    id: 5,
    title: 'Ventes et gestion de comptes',
    description: 'Stimuler la croissance grâce à des stratégies de vente expertes et une gestion de compte dédiée pour établir des relations clients durables.',
    image: '/images/sales.png',
    icon: '/icons/sales.svg',
    details: 'Stratégies de vente B2B/B2C, gestion CRM, développement commercial.'
  },
  {
    id: 6,
    title: 'Surveillance CCTV',
    description: 'Assurez la sécurité avec surveillance CCTV 24/7, alertes en temps réel et accès à distance, partout et à tout moment.',
    image: '/images/cctv.png',
    icon: '/icons/security.svg',
    details: 'Installation, maintenance, monitoring à distance et solutions de sécurité intégrées.'
  }
];

const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState(services[0]);
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      y: 50, 
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
      scale: 1.02,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <section id="Services" className="py-12 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Découvrez
            <br />
            Nos solutions
          </motion.h2>
          
          <motion.p 
            className="text-lg text-gray-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Chez VisioAd, nous offrons des services complets pour booster la portée de votre marque, 
            de la stratégie marketing à la création de contenu et production média, pour stimuler 
            croissance et engagement.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <AnimatedButton variant="primary" className="group">
              <span className="flex items-center justify-center gap-2">
                explorer
                <motion.svg 
                  className="w-5 h-5 ml-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </motion.svg>
              </span>
            </AnimatedButton>
          </motion.div>
        </motion.div>

        {/* Services Grid - 6 cartes */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true }}
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
              onClick={() => setSelectedService(service)}
              className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                selectedService.id === service.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              {/* Image avec animation de scale au hover */}
              <motion.div 
                className="relative h-64 overflow-hidden"
                animate={{
                  scale: hoveredService === service.id ? 1.05 : 1
                }}
                transition={{ duration: 0.4 }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                
                {/* Icon avec animation de rotation */}
                <motion.div 
                  className="absolute top-4 left-4 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="relative w-8 h-8">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {/* Icon placeholder - vous pouvez remplacer par vos vraies icônes */}
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d={service.id === 1 ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" :
                           service.id === 2 ? "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" :
                           service.id === 3 ? "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" :
                           service.id === 4 ? "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" :
                           service.id === 5 ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" :
                           "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"} 
                        />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Content */}
              <div className="p-6">
                <motion.h3 
                  className="text-xl font-bold text-gray-900 mb-3"
                  animate={{
                    color: hoveredService === service.id ? '##d12127' : '#111827'
                  }}
                >
                  {service.title}
                </motion.h3>
                
                <p className="text-gray-600 mb-4">{service.description}</p>
                
                <motion.button 
                  className="text-primary font-semibold flex items-center gap-2 hover:text-primary/80 transition"
                  whileHover={{ x: 5 }}
                >
                  savoir plus
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Service Details avec animation de transition */}
        <motion.div
          key={selectedService.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-16 bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.h3 
                className="text-2xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {selectedService.title}
              </motion.h3>
              
              <motion.p 
                className="text-gray-600 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {selectedService.description}
              </motion.p>
              
              <motion.div 
                className="bg-gray-50 rounded-lg p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="font-semibold text-gray-900 mb-3">Ce que nous offrons :</h4>
                <p className="text-gray-600">{selectedService.details}</p>
              </motion.div>
            </div>
            
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-primary/5 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Bénéfices</h4>
                <ul className="space-y-2 text-gray-600">
                  {['Résultats mesurables', 'Approche personnalisée', 'Support continu'].map((benefit, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <AnimatedButton variant="primary" className="w-full">
                Demander un devis
              </AnimatedButton>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;