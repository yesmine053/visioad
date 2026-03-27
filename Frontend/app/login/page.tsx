// app/login/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const API_LOGIN = 'http://localhost:8089/visioad/backend/api/auth.php?action=login';
const API_CHECK = 'http://localhost:8089/visioad/backend/api/auth.php?action=check';

function LoginForm() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');

  const searchParams = useSearchParams();
  const router       = useRouter();
  const redirect     = searchParams.get('redirect') || '';

  // ── Redirection selon le rôle ─────────────────────────────────────────────
  // Seul l'admin a un espace dédié — les visiteurs vont sur l'accueil
  const redirectUser = (user: { role: string }) => {
    if (redirect && redirect.startsWith('/admin') && user.role === 'admin') {
      router.push(redirect);
    } else if (user.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      // visiteur → accueil du site
      router.push('/');
    }
  };

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
    }
    const errParam = searchParams.get('error');
    if (errParam) setError(decodeURIComponent(errParam));

    // Vérifier session existante
    const checkSession = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const res  = await fetch(API_CHECK, {
          headers: { Authorization: `Bearer ${token}` },
          cache:   'no-store',
        });
        const data = await res.json();
        if (data.success && data.authenticated) redirectUser(data.user);
      } catch { /* backend inaccessible, ignorer */ }
    };
    checkSession();
  }, []); // eslint-disable-line

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Email et mot de passe requis'); return; }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res  = await fetch(API_LOGIN, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), password }),
        cache:   'no-store',
      });

      const text = await res.text();
      if (!text.trim()) throw new Error('Réponse vide du serveur');

      let data: any;
      try { data = JSON.parse(text); }
      catch { throw new Error('Le serveur a retourné une réponse invalide. Vérifiez XAMPP.'); }

      if (data.success) {
        // Ajouter name = username pour le Header
        const userData = { ...data.user, name: data.user.username };
       if (data.success) {
        const userData = { ...data.user, name: data.user.username };
        localStorage.setItem('access_token', data.access_token); // ← AJOUTER
        localStorage.setItem('user',         JSON.stringify(userData));
        localStorage.setItem('permissions',  JSON.stringify(data.permissions || []));
        setSuccess(`Bienvenue ${data.user?.username || ''} !`);
        const dest = (redirect && redirect.startsWith('/admin') && data.user?.role === 'admin') 
          ? redirect 
          : data.user?.role === 'admin' 
          ? '/admin/dashboard' 
          : '/';
        setTimeout(() => { window.location.href = dest; }, 300);
      }
        setSuccess(`Bienvenue ${data.user?.username || ''} !`);
        const dest = (redirect && redirect.startsWith('/admin') && data.user?.role === 'admin') ? redirect : data.user?.role === 'admin' ? '/admin/dashboard' : '/';
        setTimeout(() => { window.location.href = dest; }, 300);
      } else {
        setError(data.message || 'Email ou mot de passe incorrect');
      }
    } catch (err: any) {
      setError(
        err.message?.includes('fetch')
          ? 'Impossible de joindre le serveur. Vérifiez que XAMPP est démarré (port 8089).'
          : err.message || 'Erreur de connexion'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "system-ui, sans-serif" }}>
      <style suppressHydrationWarning>{`
        .input-field { background:transparent;border:none;outline:none;width:100%;font-family:inherit;font-size:.9rem;color:#1a1a2e; }
        .input-field::placeholder { color:#9ca3af; }
        .input-wrapper { display:flex;align-items:center;gap:10px;padding:14px 16px;border:1.5px solid #e5e7eb;border-radius:12px;transition:all .2s;background:white; }
        .input-wrapper:focus-within { border-color:#d12127;box-shadow:0 0 0 3px rgba(209,33,39,.08); }
        .btn-primary { width:100%;padding:14px;background:#d12127;color:white;font-family:inherit;font-weight:600;font-size:.95rem;border:none;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s; }
        .btn-primary:hover:not(:disabled) { background:#b91c1c;transform:translateY(-1px);box-shadow:0 8px 25px rgba(209,33,39,.35); }
        .btn-primary:disabled { opacity:.7;cursor:not-allowed; }
        .pattern-bg { background-image:radial-gradient(circle at 1px 1px,rgba(255,255,255,.15) 1px,transparent 0);background-size:24px 24px; }
      `}</style>

      {/* ── Panneau gauche ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#d12127] flex-col justify-between p-12 relative overflow-hidden pattern-bg">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full"/>
        <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-black/10 rounded-full"/>

        <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:.2 }} className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <img src="/images/logo.png" alt="VisioAD" className="h-10 w-auto" />
          </Link>
        </motion.div>

        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:.4 }} className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-6">
            Votre espace<br />de gestion<br />
            <span className="text-white/70">VisioAD</span>
          </h2>
          <p className="text-white/80 text-lg leading-relaxed mb-10">
            Accédez à votre tableau de bord et gérez vos campagnes marketing en toute simplicité.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label:'Clients actifs',       value:'200+'  },
              { label:'Campagnes lancées',    value:'1 200+'},
              { label:'Taux de satisfaction', value:'98%'   },
              { label:"Années d'expérience",  value:'10+'   },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.6+i*.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-white/70 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.8 }} className="relative z-10 text-white/50 text-sm">
          © {new Date().getFullYear()} VISIOAD — Sousse, Tunisie
        </motion.div>
      </div>

      {/* ── Panneau droit ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5 }} className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <img src="/images/logo.png" alt="VisioAD" className="h-9 w-auto" />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
            <p className="text-gray-500">Bienvenue ! Entrez vos identifiants pour continuer.</p>
          </div>

          {/* Messages */}
          {error && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"/>
              <p className="text-red-700 text-sm flex-1">{error}</p>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0"/>
              <p className="text-green-700 text-sm">{success}</p>
            </motion.div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
              <div className="input-wrapper">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="votre@email.com" required disabled={loading} className="input-field"/>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
              <div className="input-wrapper">
                <Lock className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••" required disabled={loading} className="input-field"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0" tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={loading} className="btn-primary"
              whileHover={!loading ? { scale:1.01 } : undefined}
              whileTap={!loading ? { scale:.99 } : undefined}>
              {loading ? (
                <>
                  <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate:360 }} transition={{ duration:.8, repeat:Infinity, ease:'linear' }}/>
                  Connexion en cours...
                </>
              ) : (
                <> Se connecter <ArrowRight className="w-4 h-4"/> </>
              )}
            </motion.button>
          </form>

          {/* Liens bas */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-gray-500 text-sm">
              Pas encore de compte ?{' '}
              <Link href="/register" className="text-[#d12127] font-semibold hover:text-red-700">
                Créer un compte visiteur
              </Link>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#d12127] border-t-transparent rounded-full animate-spin"/>
      </div>
    }>
      <LoginForm/>
    </Suspense>
  );
}