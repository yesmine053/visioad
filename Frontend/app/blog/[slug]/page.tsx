import BlogPost from '@/components/Blog/BlogPost';
import BlogSidebar from '@/components/Blog/BlogSidebar';

// ✅ Next.js 14 — params doit être async
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <BlogPost slug={slug} />
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}