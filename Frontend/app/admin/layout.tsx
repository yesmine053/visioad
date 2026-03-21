// app/admin/layout.tsx
// Layout neutre — ne pas ajouter de nav ici.
// Le composant AdminLayout (Sidebar + Header rouge) est géré dans Dashboard.tsx.
// Tout wrapper supplémentaire ici causait une page blanche.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}