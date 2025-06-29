import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

export default function BlogPostPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function fetchPost() {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${slug}&select=*`;

      try {
        const res = await fetch(url, {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        });

        const data = await res.json();
        setPost(data[0] || null);
      } catch (err) {
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  return (
    <Layout>
      <div className="min-h-screen px-4 py-10 text-white">
        {loading ? (
          <p className="text-center font-header text-lg">Loading...</p>
        ) : !post ? (
          <p className="text-center font-header text-lg">Post not found.</p>
        ) : (
          <div className="max-w-3xl mx-auto">
            {post.cover_image_url && (
              <img
                src={post.cover_image_url}
                alt={`Cover for ${post.title}`}
                className="w-full rounded-lg mb-4 max-h-96 object-cover"
              />
            )}

            <h1 className="text-4xl font-header font-bold text-orange-ember mb-2">
              {post.title}
            </h1>

            <p className="text-sm text-ash-light italic mb-4">
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString()
                : 'Unknown date'}
            </p>

            {/* ✅ Render formatted HTML content */}
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
