import BlogHero from '@/components/Blog/BlogHero';
import BlogList from '@/components/Blog/BlogList';
import BlogCategories from '@/components/Blog/BlogCategories';
import Newsletter from '@/components/Blog/Newsletter';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

      <BlogHero />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Liste principale */}
          <div className="lg:w-2/3">
            <div id="recent" className="scroll-mt-20">
              <BlogList />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-8">
            <div id="categories" className="scroll-mt-20">
              <BlogCategories />
            </div>
            <Newsletter />
          </div>

        </div>
      </div>

    </div>
  );
}