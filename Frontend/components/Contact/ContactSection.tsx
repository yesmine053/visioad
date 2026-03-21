'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import AnimatedButton from '@/components/animations/AnimatedButton';

// ── Liste des pays ─────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'TN', flag: '🇹🇳', dial: '+216', name: 'Tunisie',          digits: 8  },
  { code: 'FR', flag: '🇫🇷', dial: '+33',  name: 'France',           digits: 9  },
  { code: 'DZ', flag: '🇩🇿', dial: '+213', name: 'Algérie',          digits: 9  },
  { code: 'MA', flag: '🇲🇦', dial: '+212', name: 'Maroc',            digits: 9  },
  { code: 'LY', flag: '🇱🇾', dial: '+218', name: 'Libye',            digits: 9  },
  { code: 'EG', flag: '🇪🇬', dial: '+20',  name: 'Égypte',           digits: 10 },
  { code: 'SA', flag: '🇸🇦', dial: '+966', name: 'Arabie Saoudite',  digits: 9  },
  { code: 'AE', flag: '🇦🇪', dial: '+971', name: 'Émirats Arabes',   digits: 9  },
  { code: 'DE', flag: '🇩🇪', dial: '+49',  name: 'Allemagne',        digits: 10 },
  { code: 'GB', flag: '🇬🇧', dial: '+44',  name: 'Royaume-Uni',      digits: 10 },
  { code: 'IT', flag: '🇮🇹', dial: '+39',  name: 'Italie',           digits: 10 },
  { code: 'ES', flag: '🇪🇸', dial: '+34',  name: 'Espagne',          digits: 9  },
  { code: 'US', flag: '🇺🇸', dial: '+1',   name: 'États-Unis',       digits: 10 },
  { code: 'CA', flag: '🇨🇦', dial: '+1',   name: 'Canada',           digits: 10 },
];

function formatPhoneNumber(raw: string, countryCode: string): string {
  const d = raw.replace(/\D/g, '');
  if (countryCode === 'TN') {
    // XX XXX XXX  (8 chiffres)
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0,2)} ${d.slice(2)}`;
    return `${d.slice(0,2)} ${d.slice(2,5)} ${d.slice(5,8)}`;
  }
  // Format générique par paires
  return d.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}

// ─────────────────────────────────────────────────────────────────────────────

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactId, setContactId] = useState<number | null>(null);

  const API_URL = 'http://localhost:8089/visioad/backend/api/contact.php';

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.dial.includes(countrySearch)
  );

  // Fermer dropdown au clic extérieur
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
        setCountrySearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Framer Motion variants
  const imageVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
  };
  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, delay: 0.2 } }
  };
  const inputVariants = { focus: { scale: 1.02, transition: { duration: 0.2 } } };
  const socialIconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: (i: number) => ({ scale: 1, rotate: 0, transition: { delay: i * 0.1, type: 'spring' as const, stiffness: 200 } }),
    hover: { scale: 1.2, rotate: 360, backgroundColor: '#d12127', color: 'white', transition: { duration: 0.4 } }
  };

  const notifyDashboard = (id: number) => {
    localStorage.setItem('contact_refresh_needed', Date.now().toString());
    window.dispatchEvent(new CustomEvent('contactSubmitted', { detail: { contactId: id, timestamp: new Date().toISOString() } }));
    window.postMessage({ type: 'NEW_CONTACT', contactId: id }, '*');
  };



  const validateForm = () => {
    if (!formData.name.trim())  { setError('Le nom est obligatoire'); return false; }
    if (!formData.email.trim()) { setError("L'email est obligatoire"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Adresse email invalide'); return false; }
    if (!formData.message.trim()) { setError('Le message est obligatoire'); return false; }
    const clean = phoneDigits.replace(/\s/g, '');
    if (clean.length > 0 && clean.length !== selectedCountry.digits) {
      setError(`Le numéro ${selectedCountry.name} doit contenir ${selectedCountry.digits} chiffres`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setContactId(null);
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const phone = phoneDigits.replace(/\s/g, '').length > 0 ? `${selectedCountry.dial} ${phoneDigits}` : '';
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        mode: 'cors', credentials: 'omit',
        body: JSON.stringify({ ...formData, phone })
      });
      const result = JSON.parse(await res.text());
      if (!res.ok || !result.success) throw new Error(result.message || `Erreur HTTP ${res.status}`);
      setContactId(result.contact_id);
      setIsSubmitted(true);
      notifyDashboard(result.contact_id);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setPhoneDigits('');
      setTimeout(() => { setIsSubmitted(false); setContactId(null); }, 8000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion. Vérifiez que XAMPP est démarré.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, selectedCountry.digits);
    setPhoneDigits(formatPhoneNumber(raw, selectedCountry.code));
    if (error) setError(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <section id="Contact" className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* Image */}
          <motion.div variants={imageVariants} initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.3 }} className="relative rounded-2xl overflow-hidden shadow-xl">
            <div className="relative h-[500px]">
              <Image src="/images/contact.png" alt="Contactez VisioAD" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <motion.div className="absolute bottom-0 left-0 right-0 p-8 text-white"
                initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.5 }}>
                <h3 className="text-2xl font-bold mb-4">Notre localisation</h3>
                <p className="text-lg">Immeuble Centre Ibrahim, Av. Habib Bourguiba<br />Sousse 4000, Tunisie</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Formulaire */}
          <motion.div variants={formVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <motion.h2 className="text-3xl md:text-4xl font-bold text-primary mb-6"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1 }}>
              Obtenez un devis gratuit
            </motion.h2>
            <motion.p className="text-gray-600 mb-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.2 }}>
              Nous sommes impatients de vous rencontrer ! Remplissez le formulaire
              ci-dessous et transformons votre vision en réalité.
            </motion.p>

            {/* Erreur */}
            {error && (
              <motion.div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg"
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div><p className="font-semibold">Erreur d'envoi</p><p className="text-sm mt-1">{error}</p></div>
                </div>
              </motion.div>
            )}

            {/* Succès */}
            {isSubmitted && contactId && (
              <motion.div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg"
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold">✅ Message envoyé avec succès !</p>
                    <p className="text-sm mt-1">Numéro de référence : #{contactId}</p>
                    <p className="text-xs text-green-600 mt-2">Notre équipe vous contactera dans les plus brefs délais.</p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.form onSubmit={handleSubmit} className="space-y-6"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.3 }}>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Nom */}
                {[
                  { id: 'name',    label: 'Nom *',  type: 'text',  placeholder: 'Votre nom complet',      required: true  },
                  { id: 'email',   label: 'Email *', type: 'email', placeholder: 'votre@email.com',        required: true  },
                  { id: 'subject', label: 'Sujet',   type: 'text',  placeholder: 'Sujet de votre message', required: false },
                ].map((field, index) => (
                  <motion.div key={field.id}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.01 }}>
                    <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                    <motion.input
                      type={field.type} id={field.id} name={field.id}
                      value={formData[field.id as keyof typeof formData]}
                      onChange={handleChange} required={field.required}
                      placeholder={field.placeholder} disabled={isSubmitting || isSubmitted}
                      className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-primary focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                      whileFocus="focus" variants={inputVariants}
                    />
                  </motion.div>
                ))}

                {/* ── Téléphone avec sélecteur de pays ── */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.01 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>

                  <div className="flex items-stretch border-b-2 border-gray-300 focus-within:border-primary transition-colors">
                    {/* Bouton sélecteur pays */}
                    <div className="relative flex-shrink-0" ref={dropdownRef}>
                      <button type="button"
                        onClick={() => { setCountryOpen(!countryOpen); setCountrySearch(''); }}
                        disabled={isSubmitting || isSubmitted}
                        className="flex items-center gap-1.5 px-3 py-3 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed h-full">
                        <span className="text-xl">{selectedCountry.flag}</span>
                        <span className="text-sm font-semibold text-gray-700 tabular-nums">{selectedCountry.dial}</span>
                        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${countryOpen ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown */}
                      <AnimatePresence>
                        {countryOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 top-full mt-1 w-68 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                            style={{ width: '280px' }}>
                            {/* Recherche */}
                            <div className="p-2 border-b border-gray-100">
                              <input type="text" placeholder="Rechercher un pays..."
                                value={countrySearch} onChange={e => setCountrySearch(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                autoFocus />
                            </div>
                            <ul className="max-h-56 overflow-y-auto">
                              {filteredCountries.map(country => (
                                <li key={country.code}>
                                  <button type="button"
                                    onClick={() => { setSelectedCountry(country); setPhoneDigits(''); setCountryOpen(false); setCountrySearch(''); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition text-left ${
                                      selectedCountry.code === country.code ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'
                                    }`}>
                                    <span className="text-lg">{country.flag}</span>
                                    <span className="flex-1">{country.name}</span>
                                    <span className="text-gray-400 font-mono text-xs">{country.dial}</span>
                                  </button>
                                </li>
                              ))}
                              {filteredCountries.length === 0 && (
                                <li className="px-4 py-4 text-sm text-gray-400 text-center">Aucun pays trouvé</li>
                              )}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Séparateur vertical */}
                    <div className="w-px bg-gray-200 my-2 flex-shrink-0" />

                    {/* Saisie numéro */}
                    <input type="tel" value={phoneDigits} onChange={handlePhoneInput}
                      placeholder={
                        selectedCountry.code === 'TN' ? '00 000 000' :
                        Array(Math.ceil(selectedCountry.digits / 2)).fill('00').join(' ')
                      }
                      disabled={isSubmitting || isSubmitted}
                      className="flex-1 px-4 py-3 focus:outline-none bg-transparent text-gray-900 placeholder-gray-300 tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                      inputMode="numeric" />

                    {/* Compteur */}
                    {phoneDigits.replace(/\s/g, '').length > 0 && (
                      <span className={`self-center pr-3 text-xs font-semibold tabular-nums ${
                        phoneDigits.replace(/\s/g, '').length === selectedCountry.digits ? 'text-green-500' : 'text-gray-400'
                      }`}>
                        {phoneDigits.replace(/\s/g, '').length}/{selectedCountry.digits}
                      </span>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Message — ✅ sans minLength */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.7 }} whileHover={{ scale: 1.01 }}>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <motion.textarea id="message" name="message"
                  value={formData.message} onChange={handleChange}
                  required rows={4}
                  className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-primary focus:outline-none transition resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Décrivez votre projet..."
                  whileFocus="focus" variants={inputVariants}
                  disabled={isSubmitting || isSubmitted}
                />
              </motion.div>



              {/* Bouton */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.8 }}>
                <AnimatedButton type="submit" variant="primary" className="w-full"
                  disabled={isSubmitting || isSubmitted}>
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                      Envoi en cours...
                    </span>
                  ) : isSubmitted ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Message envoyé !
                    </span>
                  ) : 'Demandez votre devis'}
                </AnimatedButton>
                <p className="text-center text-gray-400 text-xs mt-3">* Champs obligatoires • Réponse garantie sous 24h</p>
              </motion.div>
            </motion.form>

            {/* Contact Info */}
            <motion.div className="mt-12 pt-8 border-t border-gray-200"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.9 }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <motion.div className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: 1 }}>
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href="mailto:Info@visioad.com" className="text-gray-700 hover:text-primary transition">Info@visioad.com</a>
                  </motion.div>
                  <motion.div className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: 1.1 }}>
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href="tel:+21631439350" className="text-gray-700 hover:text-primary transition">+216 31 439 350</a>
                  </motion.div>
                </div>
                <div className="flex items-center gap-4">
                  {[ 'linkedin'].map((social, index) => (
                    <motion.a key={social} href="https://www.linkedin.com/company/stevisioad/" custom={index}
                      initial="hidden" whileInView="visible" whileHover="hover"
                      viewport={{ once: true }} variants={socialIconVariants}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
                      aria-label={social}>
                      <span className="font-semibold">{social.charAt(0).toUpperCase()}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;