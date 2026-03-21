// Footer.tsx - Version avec newsletter connectée au backend PHP
'use client';

import { newsletterApi } from '@/lib/apiClient';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

const Footer = () => {
  const socialIcons = [
    { name: 'facebook', icon: 'f', color: '#1877F2', url: 'https://www.facebook.com/visioad/?locale=fr_FR' },
    { name: 'instagram', icon: '📷', color: '#E4405F', url: 'https://www.instagram.com/ste_visioad/' },
    { name: 'linkedin', icon: 'in', color: '#0A66C2', url: 'https://www.linkedin.com/company/stevisioad/' },
    { name: 'youtube', icon: '▶️', color: '#FF0000', url: 'https://youtube.com/visioad' }
  ];
  
  const footerLinks = [
    { 
      title: 'Services', 
      links: [
        { name: 'Marketing Digital', href: '/#Services' },
        { name: 'Création de contenu', href: '/#Services' },
        { name: 'Développement Web', href: '/#Services' },
        { name: 'Design', href: '/#Services' },
        { name: 'Sécurité CCTV', href: '/#Services' }
      ] 
    },
    { 
      title: 'Entreprise', 
      links: [
        { name: 'À propos', href: '/#a-propos' },
        { name: 'FAQ', href: '/#FAQ' },
        { name: 'Témoignages', href: '/#temoignages' },
        { name: 'Contact', href: '/#Contact' }
      ] 
    },
    { 
      title: 'Blog', 
      links: [
        { name: 'Articles récents', href: '/blog#recent' },
        { name: 'Catégories', href: '/blog#categories' },
        { name: 'Recherche', href: '/blog' }
      ] 
    },
  ];

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);


  const socialIconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: (index: number) => ({
      scale: 1, rotate: 0,
      transition: { delay: index * 0.1, type: 'spring' as const, stiffness: 200 }
    }),
    hover: { scale: 1.2, rotate: 360, transition: { duration: 0.4 } }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsNewsletterSubmitting(true);
    setNewsletterError(null);
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      setNewsletterError('Veuillez entrer une adresse email valide');
      setIsNewsletterSubmitting(false);
      return;
    }

    try {
      const result = await newsletterApi.subscribe(newsletterEmail);
      
      if (result.success) {
        setNewsletterMessage(result.message || 'Merci pour votre inscription !');
        setNewsletterEmail('');
        setTimeout(() => setNewsletterMessage(''), 5000);
      } else {
        setNewsletterError(result.message || "Erreur lors de l'inscription");
      }
    } catch (error) {
      console.error('Erreur newsletter:', error);
      setNewsletterError('Erreur de connexion. Vérifiez que XAMPP est démarré.');
    } finally {
      setIsNewsletterSubmitting(false);
    }
  };

  const scrollToSection = (e: React.MouseEvent, href: string) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const sectionId = href.substring(2);
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      className="bg-gray-900 text-white"
    >
      {/* Newsletter Section */}
      <motion.div 
        className="bg-primary py-12"
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h3 
              className="text-2xl md:text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Restez informé des dernières tendances
            </motion.h3>
            <motion.p 
              className="text-white/90 mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Recevez nos conseils exclusifs et astuces marketing directement dans votre boîte mail.
            </motion.p>
            
            <motion.form 
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => { setNewsletterEmail(e.target.value); setNewsletterError(null); }}
                  placeholder="Votre adresse email"
                  required
                  disabled={isNewsletterSubmitting}
                  className="w-full px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {newsletterError && (
                  <motion.p 
                    className="absolute left-0 right-0 -bottom-6 text-xs text-red-200"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {newsletterError}
                  </motion.p>
                )}
              </div>
              <motion.button
                type="submit"
                disabled={isNewsletterSubmitting}
                className="px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isNewsletterSubmitting ? { scale: 1.05 } : undefined}
                whileTap={!isNewsletterSubmitting ? { scale: 0.95 } : undefined}
              >
                {isNewsletterSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Inscription...
                  </span>
                ) : "S'inscrire"}
              </motion.button>
            </motion.form>

            {newsletterMessage && (
              <motion.div 
                className="mt-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white font-medium">{newsletterMessage}</span>
                </div>
              </motion.div>
            )}

            <motion.p 
              className="mt-8 text-white/60 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Nous respectons votre vie privée. Désinscription à tout moment.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-5 gap-12 mb-12">
          {/* Company Info */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="text-2xl font-bold mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                VISIOAD
              </span>
            </motion.div>
            <p className="text-gray-400">
              Solutions digitales innovantes pour transformer votre vision en réalité.
            </p>
            <div className="flex items-center gap-4 pt-4">
              {socialIcons.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  whileHover="hover"
                  viewport={{ once: true }}
                  variants={socialIconVariants}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
                  style={{ backgroundColor: social.color }}
                  aria-label={`Suivez-nous sur ${social.name}`}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="font-semibold text-sm">{social.icon}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links */}
          {footerLinks.map((section, sectionIndex) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <h4 className="font-semibold text-white mb-6 text-lg">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <motion.li 
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: linkIndex * 0.05 }}
                    whileHover={{ x: 5 }}
                  >
                    {link.href.startsWith('/#') ? (
                      <a 
                        href={link.href}
                        onClick={(e) => scrollToSection(e, link.href)}
                        className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group cursor-pointer"
                      >
                        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {link.name}
                      </a>
                    ) : (
                      <Link 
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                      >
                        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {link.name}
                      </Link>
                    )}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Copyright */}
        <motion.div 
          className="pt-8 border-t border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-gray-400 text-center md:text-left">
              © {new Date().getFullYear()} VISIOAD — Tous droits réservés
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-gray-400">
              <motion.a 
                href="mailto:Info@visioad.com"
                className="flex items-center gap-2 hover:text-white transition-colors group"
                whileHover={{ scale: 1.05 }}
              >
                <svg className="w-5 h-5 text-primary group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Info@visioad.com</span>
              </motion.a>
              <motion.a 
                href="tel:+21631439350"
                className="flex items-center gap-2 hover:text-white transition-colors group"
                whileHover={{ scale: 1.05 }}
              >
                <svg className="w-5 h-5 text-primary group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+216 31 439 350</span>
              </motion.a>
            </div>
          </div>
          
          <motion.div 
            className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <p className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Immeuble Centre Ibrahim, Av. Habib Bourguiba, Sousse 4000, Tunisie
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;