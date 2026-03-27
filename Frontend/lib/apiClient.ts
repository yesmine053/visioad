// lib/apiClient.ts
// Utilitaire centralisé pour tous les appels API vers le backend PHP POO
// Remplace api-config.ts — port corrigé, sans données mock

const API_BASE = 'http://localhost:8089/visioad/backend/api';

// ── Token JWT depuis localStorage ─────────────────────────────────────────────
function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('access_token') || '';
}

// ── Headers par défaut avec authentification ──────────────────────────────────
function authHeaders(contentType = true): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (contentType) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ── Fonction générique fetch avec timeout ─────────────────────────────────────
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  timeout = 8000
): Promise<T> {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers || {}) },
      signal:  controller.signal,
    });

    clearTimeout(timer);

    // Lire le texte brut d'abord pour éviter le crash si PHP renvoie du HTML
    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Réponse non-JSON du serveur (${res.status}): ${text.substring(0, 100)}`);
    }

    if (!res.ok) throw new Error(data?.message || `Erreur HTTP ${res.status}`);
    return data as T;

  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('Délai dépassé — vérifiez que XAMPP est démarré');
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════
export const authApi = {
  login: (email: string, password: string) =>
    request<any>('auth.php?action=login', {
      method: 'POST',
      body:   JSON.stringify({ email, password }),
    }),

  register: (data: { username: string; email: string; password: string; role: string }) =>
    request<any>('auth.php?action=register', {
      method: 'POST',
      body:   JSON.stringify(data),
    }),

  check: () =>
    request<any>('auth.php?action=check'),

  permissions: () =>
    request<any>('auth.php?action=permissions'),
};

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD (admin)
// ═══════════════════════════════════════════════════════════════════════════════
export const dashboardApi = {
  getStats:  () => request<any>('dashboard.php?action=stats'),
  getRecent: () => request<any>('dashboard.php?action=recent'),
  getCharts: () => request<any>('dashboard.php?action=charts'),
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILISATEURS (admin)
// ═══════════════════════════════════════════════════════════════════════════════
export const usersApi = {
  list: (page = 1, limit = 10, search = '', role = '') =>
    request<any>(`users.php?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&role=${role}`),

  getById: (id: number) =>
    request<any>(`users.php?id=${id}`),

  create: (data: any) =>
    request<any>('users.php', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: any) =>
    request<any>(`users.php?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: number) =>
    request<any>(`users.php?id=${id}`, { method: 'DELETE' }),

  stats: () =>
    request<any>('users.php?action=stats'),

  recent: (limit = 8) =>
    request<any>(`users.php?action=recent&limit=${limit}`),
};

// ═══════════════════════════════════════════════════════════════════════════════
// BLOG
// ═══════════════════════════════════════════════════════════════════════════════
export const blogApi = {
  list: (limit = 100, sort = 'created_at') =>
    request<any>(`blog.php?limit=${limit}&sort=${sort}`),

  getBySlug: (slug: string) =>
    request<any>(`blog.php?action=show&slug=${slug}`),

  featured: () =>
    request<any>('blog.php?action=featured'),

  categories: () =>
    request<any>('blog.php?action=categories'),

  search: (q: string) =>
    request<any>(`blog.php?action=search&q=${encodeURIComponent(q)}`),

  create: (data: any) =>
    request<any>('blog.php?action=create', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: any) =>
    request<any>(`blog.php?action=update&id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: number) =>
    request<any>(`blog.php?action=delete&id=${id}`, { method: 'DELETE' }),

  addComment: (data: { post_id: number; author_name: string; content: string }) =>
    request<any>('blog.php?action=comment', { method: 'POST', body: JSON.stringify(data) }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACTS (admin)
// ═══════════════════════════════════════════════════════════════════════════════
export const contactApi = {
  // Formulaire public (pas de token requis)
  send: (data: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    fetch(`${API_BASE}/contact.php`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body:    JSON.stringify(data),
    }).then(r => r.json()),

  // Admin
  list: () => request<any>('contact.php?action=list'),

  markRead:    (id: number) =>
    request<any>('contact.php?action=read',    { method: 'PUT', body: JSON.stringify({ id }) }),

  markReplied: (id: number) =>
    request<any>('contact.php?action=replied', { method: 'PUT', body: JSON.stringify({ id }) }),

  delete: (id: number) =>
    request<any>('contact.php?action=delete',  { method: 'DELETE', body: JSON.stringify({ id }) }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEWSLETTER
// ═══════════════════════════════════════════════════════════════════════════════
export const newsletterApi = {
  // Abonnement public (pas de token requis)
  subscribe: (email: string) =>
    fetch(`${API_BASE}/newsletter.php`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body:    JSON.stringify({ email }),
    }).then(r => r.json()),

  // Admin
  list:   () => request<any>('newsletter.php?action=list'),
  delete: (id: number) =>
    request<any>(`newsletter.php?action=delete&id=${id}`, { method: 'DELETE' }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS (admin)
// ═══════════════════════════════════════════════════════════════════════════════
export const analyticsApi = {
  getData: (period: '30d' | '90d' | '12m' = '30d') =>
    request<any>(`analytics.php?period=${period}`),
};

// ═══════════════════════════════════════════════════════════════════════════════
// MEDIA (admin)
// ═══════════════════════════════════════════════════════════════════════════════
export const mediaApi = {
  list: (page = 1, limit = 20, search = '') =>
    request<any>(`media.php?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),

  upload: (file: File): Promise<any> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('action', 'upload');
    return fetch(`${API_BASE}/media.php`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body:    fd,
    }).then(r => r.json());
  },

  delete: (id: number) =>
    request<any>('media.php', { method: 'DELETE', body: JSON.stringify({ id }) }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════════

// Formater un nombre en français

// Tester la connexion au backend
export async function testConnection(): Promise<boolean> {
  try {
    const data = await request<any>('auth.php?action=check');
    return !!data;
  } catch {
    return false;
  }
}