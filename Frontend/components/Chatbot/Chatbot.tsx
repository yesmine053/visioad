// components/Chatbot/Chatbot.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, HelpCircle, Phone, Mail } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "👋 Bonjour ! Je suis l'assistant virtuel de VisioAD. Comment puis-je vous aider aujourd'hui ?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Données de base sur VisioAD
  const companyInfo = {
    name: "VisioAD",
    description: "Agence spécialisée en marketing digital, création de contenu et développement web",
    services: [
      "Marketing Digital",
      "Création de Contenu",
      "Développement Web",
      "Design",
      "Sécurité CCTV"
    ],
    contact: {
      email: "Info@visioad.com",
      phone: "+216 31 439 350",
      location: "Immeuble Centre Ibrahim, Av. Habib Bourguiba, Sousse 4000, Tunisie"
    },
    hours: "Lun-Ven: 8h-18h",
    expertise: "Depuis 2022, nous transformons les visions en réalité digitale"
  };

  // Questions fréquentes et réponses
  const faqResponses: Record<string, string> = {
    "bonjour": `👋 Bonjour ! Bienvenue chez VisioAD. Je suis ravi de vous aider !`,
    "salut": `👋 Salut ! Comment puis-je vous assister aujourd'hui ?`,
    "services": `🎯 **Nos services :**\n• Marketing Digital\n• Création de Contenu\n• Développement Web\n• Design UX/UI\n• Sécurité CCTV\n\nQuel service vous intéresse particulièrement ?`,
    "prix": `💰 Nos tarifs varient selon vos besoins spécifiques. Pour un devis personnalisé gratuit :\n1. Décrivez votre projet\n2. Nous analysons vos besoins\n3. Vous recevez un devis détaillé\n\n👉 Contactez-nous directement pour une consultation gratuite !`,
    "tarifs": `💰 Les tarifs dépendent de la complexité de votre projet. Nous offrons :\n• Consultation gratuite\n• Devis personnalisé\n• Solutions adaptées à votre budget\n\n📞 Appelez-nous au ${companyInfo.contact.phone} pour en discuter.`,
    "contact": `📞 **Contactez-nous :**\n📧 Email : ${companyInfo.contact.email}\n📱 Téléphone : ${companyInfo.contact.phone}\n📍 Adresse : ${companyInfo.contact.location}\n⏰ Horaires : ${companyInfo.hours}`,
    "email": `📧 Notre email : ${companyInfo.contact.email}\nNous répondons généralement dans les 24h ouvrables.`,
    "téléphone": `📱 Numéro de téléphone : ${companyInfo.contact.phone}\nAppelez-nous du lundi au vendredi de 8h à 18h.`,
    "adresse": `📍 Nous sommes situés : ${companyInfo.contact.location}\n(Sousse, Tunisie)`,
    "heures": `⏰ **Horaires d'ouverture :**\n${companyInfo.hours}\n• Samedi : Sur rendez-vous\n• Dimanche : Fermé`,
    "marketing": `📢 **Marketing Digital :**\n• Stratégie marketing\n• Publicité en ligne (Google Ads, Meta Ads)\n• SEO/SEA & Référencement\n• Réseaux sociaux\n• Email marketing\n\nParlez-moi de vos objectifs !`,
    "seo": `🔍 **SEO & Référencement :**\n• Audit SEO complet\n• Optimisation on-page\n• Stratégie de contenu\n• Suivi des performances\n\nNous vous aidons à être visible sur Google !`,
    "ia": `🤖 **Intelligence Artificielle :**\nNous intégrons l'IA dans vos stratégies marketing :\n• Automatisation\n• Analyse de données\n• Personnalisation\n• Chatbots & assistants\n\nContactez-nous pour en savoir plus !`,
    "content": `✍️ **Création de Contenu :**\n• Articles de blog\n• Posts réseaux sociaux\n• Newsletters\n• Vidéos & visuels\n\nNous créons du contenu qui convertit !`,
    "développement": `💻 **Développement Web :**\n• Sites vitrines\n• E-commerce\n• Applications web\n• Maintenance\n• Hébergement\n\nVous avez un projet spécifique en tête ?`,
    "design": `🎨 **Design :**\n• Identité visuelle\n• UI/UX Design\n• Charte graphique\n• Logos\n• Supports print\n\nSouhaitez-vous voir nos réalisations ?`,
    "blog": `📚 Notre blog est disponible sur /blog\nVous y trouverez des articles sur :\n• Marketing digital & SEO\n• Développement web (PHP, Next.js)\n• Intelligence artificielle\n• Social media & Content marketing\n• Design UX/UI\n\n👉 Visitez localhost:3000/blog pour lire nos articles !`,
    "projet": `🚀 **Pour démarrer un projet :**\n1. Contactez-nous\n2. Consultation gratuite\n3. Analyse de vos besoins\n4. Proposition sur mesure\n5. Lancement du projet\n\nPrêt à concrétiser votre vision ?`,
    "devis": `📄 **Demande de devis :**\n1. Remplissez notre formulaire de contact\n2. Ou appelez-nous directement\n3. Nous étudions votre besoin\n4. Devis gratuit sous 48h\n\nSouhaitez-vous être mis en contact ?`,
    "urgence": `⚠️ **Pour une demande urgente :**\n📱 Appelez-nous directement au ${companyInfo.contact.phone}\nNous ferons de notre mieux pour vous répondre rapidement !`,
    "équipe": `👥 **Notre équipe :**\nUne équipe d'experts passionnés spécialisés dans :\n• Marketing\n• Développement\n• Design\n• Stratégie digitale\n\nExpérience depuis 2022 !`,
    "réalisations": `🏆 **Nos réalisations :**\nNous avons accompagné de nombreuses entreprises dans leur transformation digitale.\n\nConsultez notre portfolio ou contactez-nous pour des références spécifiques.`,
    "cctv": `🔒 **Sécurité CCTV :**\n• Installation de caméras\n• Systèmes de surveillance\n• Solutions de sécurité\n• Maintenance technique\n\nProtégez votre entreprise avec nos solutions.`,
    "merci": `😊 De rien ! N'hésitez pas si vous avez d'autres questions. Bonne journée !`,
  };

  // Suggestions rapides
  const quickQuestions = [
    "Quels sont vos services ?",
    "Comment vous contacter ?",
    "Avez-vous un blog ?",
    "Parlez-moi du SEO"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const findBestResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    // Recherche par mot-clé
    for (const [keyword, response] of Object.entries(faqResponses)) {
      if (lowerQuestion.includes(keyword.toLowerCase())) {
        return response;
      }
    }

    // Réponses par défaut pour d'autres questions
    if (lowerQuestion.includes("qui êtes")) {
      return `🤖 Je suis l'assistant virtuel de ${companyInfo.name}, votre partenaire en solutions digitales ! ${companyInfo.description}`;
    }

    if (lowerQuestion.includes("quoi") || lowerQuestion.includes("comment")) {
      return `❓ Je ne suis pas sûr de comprendre votre question. Pour des informations précises, je vous recommande de :\n1. Consulter notre site web\n2. Nous appeler au ${companyInfo.contact.phone}\n3. Nous envoyer un email à ${companyInfo.contact.email}\n\nNotre équipe humaine sera ravie de vous aider !`;
    }

    // Réponse par défaut
    return `🤔 Je n'ai pas d'information précise sur ce sujet. Pour des questions spécifiques, contactez directement notre équipe :\n\n📞 ${companyInfo.contact.phone}\n📧 ${companyInfo.contact.email}\n\nIls pourront vous répondre avec précision !`;
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simuler un délai de réponse
    setTimeout(() => {
      const response = findBestResponse(input);
      const botMessage: Message = {
        id: messages.length + 2,
        text: response,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickQuestion = (question: string) => {
    if (!question.trim()) return;
    // Ajouter directement le message sans passer par setInput
    const userMessage: Message = {
      id: Date.now(),
      text: question,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setTimeout(() => {
      const response = findBestResponse(question);
      const botMessage: Message = {
        id: Date.now() + 1,
        text: response,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 1,
        text: "👋 Bonjour ! Je suis l'assistant virtuel de VisioAD. Comment puis-je vous aider aujourd'hui ?",
        isBot: true,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <>
      {/* Bouton flottant */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-2xl flex items-center justify-center text-white hover:shadow-3xl transition-all duration-300"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20
        }}
      >
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2"
            >
              <div className="relative">
                <motion.div
                  className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-primary text-xs font-bold"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 rounded-full bg-white animate-ping opacity-20"
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.5 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          animate={{
            rotate: isOpen ? 90 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </motion.div>
      </motion.button>

      {/* Fenêtre du chat */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Chat Window */}
            <motion.div
              className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.8 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary/80 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                    animate={{
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 5
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-white">Assistant VisioAD</h3>
                    <p className="text-white/80 text-sm">En ligne • Prêt à aider</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={resetChat}
                    className="p-2 text-white/80 hover:text-white"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Nouvelle conversation"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-white/80 hover:text-white"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-4 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.isBot
                            ? 'bg-gray-100 text-gray-800 rounded-tl-none'
                            : 'bg-primary text-white rounded-tr-none'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.isBot ? (
                            <Bot className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.isBot ? 'Assistant' : 'Vous'}
                          </span>
                        </div>
                        <div className="whitespace-pre-line text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: message.text
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/^• /gm, '&bull; ')
                          }}
                        />
                        <div className="text-xs opacity-50 mt-2 text-right">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 rounded-2xl p-4 rounded-tl-none">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-primary" />
                          <span className="text-xs opacity-70">Assistant tape...</span>
                        </div>
                        <div className="flex gap-1 mt-2">
                          <motion.div
                            className="w-2 h-2 bg-primary rounded-full"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-primary rounded-full"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-primary rounded-full"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Suggestions rapides */}
                  {messages.length === 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-4"
                    >
                      <p className="text-sm text-gray-500 mb-3">Questions rapides :</p>
                      <div className="flex flex-wrap gap-2">
                        {quickQuestions.map((question, index) => (
                          <motion.button
                            key={index}
                            onClick={() => handleQuickQuestion(question)}
                            className="px-3 py-2 bg-gray-100 hover:bg-primary hover:text-white text-gray-700 rounded-full text-sm transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            {question}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Posez votre question..."
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    disabled={isTyping}
                  />
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                    className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
                
                {/* Contact rapide */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                  <motion.a
                    href={`tel:${companyInfo.contact.phone}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Phone className="w-4 h-4" />
                    Appeler
                  </motion.a>
                  <motion.a
                    href={`mailto:${companyInfo.contact.email}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;