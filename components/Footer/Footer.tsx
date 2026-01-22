// Footer.tsx - Version améliorée
'use client';

import { motion } from 'framer-motion';

const Footer = () => {
  const socialIcons = [
    { name: 'facebook', icon: 'f', color: '#1877F2' },
    { name: 'instagram', icon: '📷', color: '#E4405F' },
    { name: 'linkedin', icon: 'in', color: '#0A66C2' },
    { name: 'youtube', icon: '▶️', color: '#FF0000' }
  ];
  
  const footerLinks = [
    { title: 'Services', links: ['Marketing Digital', 'Création de contenu', 'Développement Web', 'Design', 'Sécurité CCTV'] },
    { title: 'Entreprise', links: ['À propos', 'FAQ', 'Témoignages', 'Partenaires', 'Contact'] },
    { title: 'Ressources', links: ['Blog', 'Guides', 'Cas clients', 'Outils gratuits'] },
    { title: 'Légal', links: ['Mentions légales', 'Confidentialité', 'Conditions', 'Cookies'] }
  ];

  const socialIconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: (index: number) => ({
      scale: 1,
      rotate: 0,
      transition: {
        delay: index * 0.1,
        type: 'spring' as const,
        stiffness: 200
      }
    }),
    hover: {
      scale: 1.2,
      rotate: 360,
      transition: {
        duration: 0.4
      }
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
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <motion.button
                type="submit"
                className="px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                S'inscrire
              </motion.button>
            </motion.form>
          </div>
        </div>
      </motion.div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-12 mb-12">
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
              VISIOAD
            </motion.div>
            <p className="text-gray-400">
              Solutions digitales innovantes pour transformer votre vision en réalité.
            </p>
            <div className="flex items-center gap-4 pt-4">
              {socialIcons.map((social, index) => (
                <motion.a
                  key={social.name}
                  href="#"
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  whileHover="hover"
                  viewport={{ once: true }}
                  variants={socialIconVariants}
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:text-white"
                  style={{ backgroundColor: social.color }}
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Sections */}
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
                    key={link}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: linkIndex * 0.05 }}
                    whileHover={{ x: 5 }}
                  >
                    <a 
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
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
              © 2024 VISIOAD — Tous droits réservés
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Info@visioad.com</span>
              </div>
              
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+216 31 439 350</span>
              </div>
            </div>
          </div>
          
          {/* Localisation */}
          <motion.div 
            className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <p>Immeuble Centre Ibrahim, Av. Habib Bourguiba, Sousse 4000, Tunisie</p>
          </motion.div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;