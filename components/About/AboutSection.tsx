'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  ArrowRight, 
  Lightbulb, 
  CheckCircle, 
  ShieldCheck, 
  Target,
  Pause,
  Sparkles,
  Eye,
  TrendingUp,
  BarChart3,
  Users,
  Target as TargetIcon,
  Zap,
  Brain,
  Rocket
} from 'lucide-react';
import AnimatedButton from '@/components/animations/AnimatedButton';

const AboutSection = () => {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      text: "Stratégies digitales intelligentes",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
      delay: 0.1
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      text: "Solutions techniques avancées",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      delay: 0.2
    },
    {
      icon: <Users className="w-6 h-6" />,
      text: "Support client dédié 24/7",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
      delay: 0.3
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      text: "Résultats mesurables garantis",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
      delay: 0.4
    }
  ];

  // Vérifier si la vidéo existe et se charge
  useEffect(() => {
    const video = videoRef.current;
    
    if (video) {
      const handleCanPlay = () => {
        setIsVideoLoaded(true);
      };

      const handleError = () => {
        console.error('Erreur de chargement vidéo');
        setHasVideoError(true);
        setIsVideoLoaded(false);
      };

      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
      
      // Charger la vidéo
      video.load();

      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      };
    }
  }, []);

  const handlePlayVideo = () => {
    if (!videoRef.current) return;

    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => {
          setIsVideoPlaying(true);
        })
        .catch(error => {
          console.error('Erreur lors de la lecture:', error);
          setHasVideoError(true);
        });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handlePlayVideo();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <section id="a-propos" className="relative py-20 md:py-28 bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden">
      {/* Background decorative elements subtils */}
      <motion.div
        className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ 
          y: [0, -40, 0],
          x: [0, 30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      <motion.div
        className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-tr from-amber-500/5 to-pink-500/5 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
        animate={{ 
          y: [0, 40, 0],
          x: [0, -30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 2 
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Title élégant */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm mb-8 group hover:border-primary/20 transition-colors duration-300"
            >
              <div className="relative">
                <Rocket className="w-5 h-5 text-primary" />
                <motion.div
                  className="absolute -inset-2 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-primary font-semibold text-sm tracking-wider uppercase">
                Innovation & Excellence Digitale
              </span>
            </motion.div>
            
            <div className="space-y-4">
              <motion.h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                  VISIOAD
                </span>
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="inline-block"
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-300"></div>
                  <p className="text-xl md:text-2xl text-gray-600 font-light">
                    Réinventons votre présence digitale
                  </p>
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-300"></div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-stretch">
            
            {/* Left Column - Video Section moderne */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative group"
            >
              {/* Cadre décoratif subtil */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 via-transparent to-primary/10 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              
              <div className="relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer h-full border border-gray-200 hover:border-primary/30 transition-colors duration-300">
                {/* Conteneur vidéo élégant */}
                <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 relative">
                  
                  {hasVideoError ? (
                    // Fallback design élégant
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/10 to-gray-800/10 p-8 backdrop-blur-sm">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' }}
                        className="text-center"
                      >
                        <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20 backdrop-blur-sm">
                          <Play className="w-16 h-16 text-primary/70" />
                        </div>
                        <p className="text-xl font-semibold text-gray-800 mb-3">Préparation en cours</p>
                        <p className="text-gray-600 text-base max-w-md">
                          Notre vidéo de présentation arrive bientôt
                        </p>
                      </motion.div>
                    </div>
                  ) : (
                    <>
                      {/* Vidéo MP4 */}
                      <video
                        ref={videoRef}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                          isVideoPlaying ? 'scale-100' : 'scale-105'
                        } ${!isVideoLoaded ? 'opacity-0' : 'opacity-100'} group-hover:scale-110 group-hover:brightness-110 transition-transform duration-700`}
                        poster="/images/video-poster.png"
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        onClick={handlePlayVideo}
                      >
                        <source src="/videos/about-video.mp4" type="video/mp4" />
                        <source src="/videos/about-video.webm" type="video/webm" />
                        Votre navigateur ne supporte pas la lecture de vidéos.
                      </video>
                      
                      {/* Overlay gradient subtil */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent transition-all duration-300 ${
                        isVideoPlaying ? 'opacity-0' : 'opacity-100'
                      } group-hover:from-black/20 group-hover:via-black/5`}></div>
                      
                      {/* Play Button élégant */}
                      {!isVideoPlaying && isVideoLoaded && (
                        <motion.button 
                          className="absolute inset-0 flex items-center justify-center focus:outline-none"
                          onClick={handlePlayVideo}
                          onKeyDown={handleKeyPress}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.3 }}
                          aria-label="Lire la vidéo"
                          disabled={hasVideoError}
                        >
                          <motion.div 
                            className="w-24 h-24 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl relative overflow-hidden border border-white/50"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                              delay: 0.5,
                              type: 'spring',
                              stiffness: 200,
                              damping: 15
                            }}
                            whileHover={{ 
                              scale: 1.05,
                            }}
                          >
                            {/* Bouton principal */}
                            <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                              <Play className="w-10 h-10 text-white ml-1 relative z-10" />
                              
                              {/* Effet de brillance */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            </div>
                          </motion.div>
                        </motion.button>
                      )}

                      {/* Contrôles en lecture */}
                      {isVideoPlaying && (
                        <motion.div 
                          className="absolute bottom-6 right-6"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.button
                            onClick={handlePlayVideo}
                            onKeyDown={handleKeyPress}
                            className="bg-white/90 backdrop-blur-sm text-primary p-3 rounded-full hover:bg-white transition-all focus:outline-none shadow-lg group relative overflow-hidden border border-white/50"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Mettre en pause"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                            <Pause className="w-5 h-5 relative z-10" />
                          </motion.button>
                        </motion.div>
                      )}

                      {/* Loading indicator élégant */}
                      {!isVideoLoaded && !hasVideoError && (
                        <motion.div 
                          className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="relative">
                            <div className="w-16 h-16 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                            </div>
                          </div>
                          <p className="text-gray-700 font-medium">Chargement de la vidéo...</p>
                        </motion.div>
                      )}

                      {/* Badge durée */}
                      <div className="absolute bottom-6 left-6">
                        <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
                          <p className="text-gray-700 text-sm font-medium flex items-center gap-2">
                            <Play className="w-3 h-3" />
                            <span className="font-semibold">2:30</span> min
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Video Label subtil */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-center"
              >
                <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200 group hover:border-primary/20 transition-colors duration-300">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <p className="text-gray-700 text-sm font-medium">
                    Découvrez notre approche unique
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Content élégant et propre */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-col justify-center"
            >
              {/* Header avec badge */}
              <motion.div variants={itemVariants} className="mb-10">
                <motion.div
                  className="inline-flex items-center gap-2 mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-primary font-bold text-sm uppercase tracking-wider">
                      Notre philosophie
                    </span>
                  </div>
                </motion.div>
                
                <motion.h2
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-gray-900">Excellence digitale,</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    résultats concrets
                  </span>
                </motion.h2>

                {/* Description élégante */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="mb-8"
                >
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Chez <span className="font-semibold text-primary">VisioAD</span>, nous croyons en la puissance 
                    de l'innovation pour transformer les défis en opportunités. Notre mission 
                    est de vous accompagner vers le succès digital avec des solutions sur mesure 
                    et des résultats mesurables.
                  </p>
                </motion.div>
              </motion.div>

              {/* Features Grid moderne et propre */}
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-2 gap-4 mb-10"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    custom={feature.delay}
                    className={`flex flex-col p-4 rounded-xl transition-all duration-300 ${feature.bgColor} border ${feature.borderColor} hover:shadow-md hover:border-gray-300 cursor-pointer group`}
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                    whileHover={{ y: -3 }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <motion.div
                        className={`p-2.5 rounded-lg ${feature.bgColor} border ${feature.borderColor} shadow-sm`}
                        animate={{
                          rotate: hoveredItem === index ? [0, 5, -5, 0] : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className={feature.color}>
                          {feature.icon}
                        </div>
                      </motion.div>
                    </div>
                    
                    <div className="flex-1">
                      <span className="text-gray-900 font-semibold text-sm block mb-1.5 group-hover:text-gray-800 transition-colors">
                        {feature.text}
                      </span>
                      <p className="text-gray-600 text-xs leading-relaxed">
                        Approche personnalisée pour chaque projet
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button élégant */}
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="relative"
              >
                <AnimatedButton 
                  variant="primary" 
                  onClick={() => {
                    document.getElementById('Contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full px-8 py-4 text-base font-semibold shadow-lg shadow-primary/20 group hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="relative z-10">Démarrer vos projet</span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="relative z-10"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </div>
                </AnimatedButton>
                
                {/* Note subtile */}
                <motion.div 
                  className="text-center mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <p className="text-gray-500 text-sm">
                    Consultation gratuite • Sans engagement
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;