'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, Send } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !email.includes('@')) { setError('Adresse email invalide'); return; }
    setSubmitting(true);
    try {
      const res  = await fetch('http://localhost:8089/visioad/backend/api/newsletter.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 5000);
      } else {
        setError(data.message || "Erreur lors de l'inscription");
      }
    } catch { setError('Erreur de connexion'); }
    finally   { setSubmitting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white">

      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Newsletter</h3>
          <p className="text-white/80 text-xs">Restez informé</p>
        </div>
      </div>

      <p className="text-white/90 text-sm mb-5">
        Recevez nos derniers articles et conseils directement dans votre boîte mail.
      </p>

      {subscribed ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-white/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-300" />
            <div>
              <p className="font-semibold text-sm">Inscription réussie !</p>
              <p className="text-xs text-white/80">Merci pour votre abonnement.</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="votre@email.com" disabled={submitting}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 text-sm" />
          {error && <p className="text-xs text-red-200">{error}</p>}
          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 text-sm">
            {submitting
              ? <><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />Inscription...</>
              : <><Send className="w-4 h-4" />S'abonner</>}
          </button>
        </form>
      )}

      <p className="text-xs text-white/60 mt-3">Désabonnement à tout moment.</p>
    </motion.div>
  );
};

export default Newsletter;