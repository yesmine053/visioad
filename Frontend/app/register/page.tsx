// app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Building, Phone, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const API_URL = 'http://localhost:8089/visioad/backend/api/auth.php?action=register';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    role: 'visitor',
    acceptTerms: false
  });
  const [showPassword, setShowPassword]             = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const router = useRouter();

  const update = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas'); return;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères'); return;
    }
    if (!formData.acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation"); return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({
          username: formData.name,
          name:     formData.name,
          email:    formData.email,
          password: formData.password,
          role:     formData.role,
          company:  formData.company,
          phone:    formData.phone
        })
      });

      const text = await res.text();
      if (!text.trim()) throw new Error('Réponse vide du serveur');
      const data = JSON.parse(text);

      if (data.success) {
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('permissions', JSON.stringify(data.permissions || []));
        }
        setSuccess('Compte créé avec succès ! Redirection...');
        setTimeout(() => {
          // Après inscription : visiteur → page login avec message de succès
          router.push('/login?registered=true');
        }, 1500);
      } else {
        setError(data.message || "Erreur lors de l'inscription");
      }
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch')) {
        setError('Impossible de joindre le serveur. Vérifiez que XAMPP est démarré.');
      } else {
        setError(err.message || 'Erreur de connexion au serveur');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Sora', sans-serif" }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');

        .input-wrap {
          display: flex; align-items: center; gap: 10px;
          padding: 13px 16px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          transition: all 0.2s;
        }
        .input-wrap:focus-within {
          border-color: #d12127;
          box-shadow: 0 0 0 3px rgba(209,33,39,0.08);
        }
        .field-input {
          background: transparent; border: none; outline: none;
          width: 100%; font-family: 'Sora', sans-serif;
          font-size: 0.875rem; color: #1a1a2e;
        }
        .field-input::placeholder { color: #9ca3af; }
        .radio-card {
          border: 1.5px solid #e5e7eb; border-radius: 12px;
          padding: 14px; cursor: pointer; transition: all 0.2s;
          text-align: center;
        }
        .radio-card.active {
          border-color: #d12127;
          background: rgba(209,33,39,0.04);
        }
        .btn-submit {
          width: 100%; padding: 14px;
          background: #d12127; color: white;
          font-family: 'Sora', sans-serif; font-weight: 600;
          font-size: 0.95rem; border: none; border-radius: 12px;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; gap: 8px; transition: all 0.2s;
        }
        .btn-submit:hover:not(:disabled) {
          background: #b91c1c; transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(209,33,39,0.35);
        }
        .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .pattern-bg {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0);
          background-size: 24px 24px;
        }
      `}</style>

      {/* ── Panneau gauche ── */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#d12127] flex-col justify-between p-12 relative overflow-hidden pattern-bg flex-shrink-0">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-black/10 rounded-full" />

        {/* Logo */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-[#d12127] font-black text-lg">V</span>
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">VISIOAD</span>
          </Link>
        </motion.div>

        {/* Contenu */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-4xl font-bold text-white leading-tight mb-6">
            Rejoignez<br />l'agence<br />
            <span className="text-white/70">digitale #1</span>
          </h2>
          <p className="text-white/80 text-lg leading-relaxed mb-10">
            Créez votre compte visiteur et accédez au blog et aux ressources VisioAD.
          </p>

          <div className="space-y-4">
            {[
              { icon: '🚀', text: 'Accès immédiat à votre dashboard' },
              { icon: '📊', text: 'Suivi de vos campagnes en temps réel' },
              { icon: '💬', text: 'Support dédié 7j/7' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
                <span className="text-xl">{item.icon}</span>
                <span className="text-white/90 text-sm">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="text-white/50 text-sm">
          © {new Date().getFullYear()} VISIOAD — Sousse, Tunisie
        </motion.div>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div className="w-full lg:w-7/12 flex items-start justify-center p-8 bg-gray-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl py-8"
        >
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-9 h-9 bg-[#d12127] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-base">V</span>
            </div>
            <span className="text-gray-900 font-bold text-xl tracking-tight">VISIOAD</span>
          </div>

          {/* Titre */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
            <p className="text-gray-500">Rejoignez VisioAD et boostez votre présence digitale.</p>
          </div>

          {/* Messages */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm flex-1">{error}</p>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700 text-sm">{success}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nom + Email */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                <div className="input-wrap">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input type="text" value={formData.name}
                    onChange={e => update('name', e.target.value)}
                    required placeholder="Votre nom" className="field-input" disabled={loading} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <div className="input-wrap">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input type="email" value={formData.email}
                    onChange={e => update('email', e.target.value)}
                    required placeholder="votre@email.com" className="field-input" disabled={loading} />
                </div>
              </div>
            </div>

            {/* Mot de passe + Confirmation */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
                <div className="input-wrap">
                  <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input type={showPassword ? 'text' : 'password'} value={formData.password}
                    onChange={e => update('password', e.target.value)}
                    required minLength={6} placeholder="••••••••" className="field-input" disabled={loading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0" tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Minimum 6 caractères</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer *</label>
                <div className="input-wrap">
                  <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword}
                    onChange={e => update('confirmPassword', e.target.value)}
                    required placeholder="••••••••" className="field-input" disabled={loading} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0" tabIndex={-1}>
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Entreprise + Téléphone */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entreprise <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <div className="input-wrap">
                  <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input type="text" value={formData.company}
                    onChange={e => update('company', e.target.value)}
                    placeholder="Nom de l'entreprise" className="field-input" disabled={loading} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <div className="input-wrap">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input type="tel" value={formData.phone}
                    onChange={e => update('phone', e.target.value)}
                    placeholder="+216 XX XXX XXX" className="field-input" disabled={loading} />
                </div>
              </div>
            </div>

            {/* Type de compte — visitor uniquement, champ caché */}
            {/* L'admin ne peut pas s'inscrire depuis ce formulaire */}

            {/* CGU */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                formData.acceptTerms ? 'bg-[#d12127] border-[#d12127]' : 'border-gray-300 group-hover:border-[#d12127]'
              }`}
                onClick={() => update('acceptTerms', !formData.acceptTerms)}>
                {formData.acceptTerms && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input type="checkbox" checked={formData.acceptTerms}
                onChange={e => update('acceptTerms', e.target.checked)} className="sr-only" />
              <p className="text-sm text-gray-600">
                J'accepte les{' '}
                <Link href="/terms" className="text-[#d12127] hover:underline">conditions d'utilisation</Link>
                {' '}et la{' '}
                <Link href="/privacy" className="text-[#d12127] hover:underline">politique de confidentialité</Link>
              </p>
            </label>

            {/* Submit */}
            <motion.button type="submit" disabled={loading}
              className="btn-submit"
              whileHover={!loading ? { scale: 1.01 } : undefined}
              whileTap={!loading ? { scale: 0.99 } : undefined}>
              {loading ? (
                <>
                  <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                  Création en cours...
                </>
              ) : (
                <>Créer mon compte <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          {/* Liens */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-gray-500 text-sm">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-[#d12127] font-semibold hover:text-red-700">Se connecter</Link>
            </p>
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1">
              ← Retour au site
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}