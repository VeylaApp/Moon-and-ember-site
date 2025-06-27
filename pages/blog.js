import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function BlogIndexPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const today = new Date().toISOString();

      const url = `https://bohmreonbrxneehnqvku.supabase.co/rest/v1/blog_posts?select=*&status=eq.published&published_at=lte.${today}&order=published_at.desc.nullslast`;

      try {
        const res = await fetch(url, {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        });

        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error('Error loading blog posts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // Dynamically construct the base URL for local or production
  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/')) {
      const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      return `${base}${url}`;
    }
    return url;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-header font-bold text-orange-ember mb-10 text-center">
           Moon & Embers Blog
        </h1>

        {loading ? (
          <p className="text-ash-light text-center">Loading blog posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-ash-light text-center">No blog posts published yet.</p>
        ) : (
          <div className="flex flex-col items-center gap-10">
            {posts.map((post) => (
              <div
                key={post.slug}
                className="w-full max-w-2xl bg-forest/60 border border-white/10 rounded-2xl shadow-lg p-6 text-white backdrop-blur-md"
              >
                {post.cover_image_url && (
                  <img
                    src={getFullImageUrl(post.cover_image_url)}
                    alt={`Cover for ${post.title}`}
                    className="rounded-lg mb-4 h-64 w-full object-cover"
                  />
                )}

                <h2 className="text-2xl font-header font-bold text-white mb-2">{post.title}</h2>

                <p className="text-sm text-ash-light italic mb-3">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Unknown Date'}
                </p>

                <p className="text-base text-white mb-4">{post.excerpt}</p>

                <div className="text-right">
                  <Link href={`/blog/${post.slug}`} className="text-orange-300 text-sm hover:underline">
                    Read more →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}


