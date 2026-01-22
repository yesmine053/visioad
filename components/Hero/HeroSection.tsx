// HeroSection.tsx - Version avec image à gauche
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import AnimatedButton from '@/components/animations/AnimatedButton';
import { Sparkles, TrendingUp, Users, Target, Zap, Award, CheckCircle, Star } from 'lucide-react';

const HeroSection = () => {
  const stats = [
    { 
      value: '15k', 
      label: 'Portée mensuelle', 
      suffix: 'réseaux sociaux', 
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    { 
      value: '900+', 
      label: 'Projets réalisés', 
      suffix: 'professionnels', 
      icon: <Sparkles className="w-6 h-6" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    { 
      value: '80%', 
      label: 'Satisfaction', 
      suffix: 'taux clients', 
      icon: <Target className="w-6 h-6" />,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    { 
      value: '2022', 
      label: "Expérience", 
      suffix: 'depuis', 
      icon: <Award className="w-6 h-6" />,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50'
    },
    { 
      value: '500+', 
      label: 'Campagnes', 
      suffix: 'impact réussies', 
      icon: <Zap className="w-6 h-6" />,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    { 
      value: '+100', 
      label: 'Talents formés', 
      suffix: 'développés', 
      icon: <Users className="w-6 h-6" />,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
  ];

  const features = [
    'Stratégies personnalisées',
    'Résultats mesurables',
    'Support 24/7',
    'Analyses approfondies'
  ];

  const statVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: custom * 0.1,
        type: 'spring' as const,
        stiffness: 100,
        damping: 12
      }
    }),
    hover: {
      y: -10,
      scale: 1.05,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24 pb-20">
      {/* Background decorative elements premium */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ 
          y: [0, -60, 0],
          x: [0, 40, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-red-500/5 to-pink-500/5 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ 
          y: [0, 40, 0],
          x: [0, -40, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1 
        }}
      />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.8, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image avec design premium (À GAUCHE maintenant) */}
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-2 lg:order-1"
          >
            {/* Conteneur principal de l'image */}
            <div className="relative">
              {/* Effet de bordure décorative */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 rounded-3xl blur-xl opacity-60" />
              
              {/* Cadre de l'image avec effet 3D */}
              <div className="relative rounded-3xl overflow-hidden border-8 border-white/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] group">
                {/* Image principale avec effets */}
                <motion.div
                  className="relative h-[500px] md:h-[600px] overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.6 }}
                >
                  <Image
                    src="/images/hero.png"
                    alt="Marketing digital VisioAD - Stratégies digitales innovantes"
                    fill
                    className="object-cover object-center scale-110 group-hover:scale-100 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    quality={90}
                  />
                  
                  {/* Overlay gradient dynamique */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Effet de brillance au survol */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </motion.div>
                
                {/* Badge flottant premium - +80% Croissance */}
                <motion.div 
                  className="absolute -top-4 -right-4 bg-gradient-to-br from-white to-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/50"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg leading-tight">+80%</div>
                      <div className="text-xs text-gray-600 font-medium">Croissance client</div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Badge Certifié Google Partner */}
                <motion.div 
                  className="absolute -bottom-4 -left-4 bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-4 shadow-2xl border border-primary/30"
                  initial={{ opacity: 0, scale: 0, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8, type: 'spring', stiffness: 100 }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Certifié</div>
                      <div className="text-xs text-white/90 font-medium">Google Partner</div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Badge satisfaction client */}
                <motion.div 
                  className="absolute top-1/2 -right-6 transform -translate-y-1/2 bg-white rounded-2xl p-3 shadow-xl border border-gray-100"
                  animate={{ 
                    y: [0, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-green-500 fill-green-500/20" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">4.9/5</div>
                      <div className="text-[10px] text-gray-500">Avis clients</div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Éléments décoratifs flottants */}
              <motion.div
                className="absolute -bottom-6 right-8 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/20"
                animate={{ 
                  y: [0, 20, 0],
                  rotate: [0, 180, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              />
              <motion.div
                className="absolute -top-6 left-6 w-16 h-16 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-full border border-red-500/20"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, -180, -360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5 
                }}
              />
              
              {/* Ligne décorative */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full" />
            </div>
          </motion.div>

          {/* Texte avec animations (À DROITE maintenant) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 order-1 lg:order-2"
          >
            <div>
              <motion.div
                className="inline-flex items-center gap-3 mb-6 px-4 py-2.5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-primary font-semibold text-sm tracking-wide">AGENCE DIGITALE CERTIFIÉE</span>
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="block">Boostez votre</span>
                <motion.span 
                  className="relative inline-block mt-2"
                  animate={{ 
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse" 
                  }}
                >
                  <span className="relative bg-gradient-to-r from-primary via-primary/90 to-primary bg-clip-text text-transparent">
                    présence digitale
                  </span>
                  <svg 
                    className="absolute -bottom-2 left-0 w-full h-2" 
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <path 
                      d="M0,5 Q25,0 50,5 T100,5" 
                      stroke="url(#gradient)" 
                      strokeWidth="3" 
                      fill="none"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#d12127" />
                        <stop offset="100%" stopColor="#f05252" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.span>
              </motion.h1>
            </div>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-600 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Nous transformons votre vision en réalité avec des stratégies digitales innovantes 
              qui génèrent des résultats mesurables et accélèrent votre croissance.
            </motion.p>
            
            {/* Features list */}
            <motion.div 
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  className="flex items-center gap-2 text-gray-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm md:text-base">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <AnimatedButton 
                variant="primary" 
                onClick={() => document.getElementById('Contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 text-lg group relative overflow-hidden shadow-lg shadow-primary/20"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Commencer maintenant
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </motion.div>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary to-primary/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </AnimatedButton>
              
              <AnimatedButton 
                variant="secondary" 
                onClick={() => document.getElementById('a-propos')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 text-lg border-2 border-primary/20 hover:border-primary/40 bg-white/80 backdrop-blur-sm"
              >
                <span className="flex items-center gap-3">
                  Découvrir notre expertise
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </span>
              </AnimatedButton>
            </motion.div>
            
            {/* Client logos mini */}
            <motion.div 
              className="pt-6 border-t border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p className="text-sm text-gray-500 mb-3">Ils nous font confiance :</p>
              <div className="flex items-center gap-6 opacity-60">
                <div className="text-xl font-bold text-gray-400">GOOGLE</div>
                <div className="text-xl font-bold text-gray-400">META</div>
                <div className="text-xl font-bold text-gray-400">AMAZON</div>
                <div className="text-xl font-bold text-gray-400">MICROSOFT</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Section améliorée */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-24"
        >
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Des résultats{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                prouvés
              </span>
            </motion.h2>
            
            <motion.p 
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Notre expertise est soutenue par des chiffres solides et des résultats concrets 
              qui démontrent notre impact sur la croissance de nos partenaires.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                custom={index}
                variants={statVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true, amount: 0.5 }}
                className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 group relative overflow-hidden"
              >
                {/* Effet de fond au survol */}
                <div className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Effet de bordure au survol */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/20 transition-all duration-300" />
                
                <div className="relative z-10">
                  <motion.div 
                    className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className={stat.color}>
                      {stat.icon}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {stat.value}
                  </motion.div>
                  
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    {stat.label}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {stat.suffix}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;