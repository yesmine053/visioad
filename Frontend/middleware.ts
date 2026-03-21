// middleware.ts — Frontend/middleware.ts
// La protection est gérée côté client par AdminLayout.tsx
// qui lit localStorage directement
// Le middleware ne fait rien — il laisse tout passer

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],  // ← aucune route interceptée
};