// app/admin/blog/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Import dynamique pour éviter les erreurs de SSR
const BlogAdmin = dynamic(() => import('@/components/Admin/BlogAdmin'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement de l'administration...</p>
      </div>
    </div>
  ),
});

export default function AdminBlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'administration...</p>
        </div>
      </div>
    }>
      <BlogAdmin />
    </Suspense>
  );
}