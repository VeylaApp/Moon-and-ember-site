import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LatestBlogPost() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestPost() {
      const today = new Date().toISOString();

      const url = `https://bohmreonbrxneehnqvku.supabase.co/rest/v1/blog_posts?select=*&status=eq.published&published_at=lte.${today}&order=published_at.desc.nullslast&limit=1`;

      try {
        const res = await fetch(url, {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        });

        if (!res.ok) {
          console.error(`HTTP error: ${res.status} ${res.statusText}`);
          setPost(null);
          return;
        }

        const data = await res.json();
        if (data.length === 0) {
          console.warn('No posts matched the filters.');
        }
        setPost(data[0] || null);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLatestPost();
  }, []);

  if (loading) return <p className="text-ash-light text-center">Loading latest post...</p>;
  if (!post) return <p className="text-ash-light text-center">🚫 No blog posts yet – stay tuned!</p>;

  return (
    <div className="bg-forest/50 p-4 rounded-lg shadow-md border border-white/10 text-white">
      <h3 className="text-xl font-header text-orange-ember mb-2">📝 Latest Blog Post 📝</h3>
      <h4 className="text-xl font-header text-white mb-1">{post.title}</h4>
      <p className="text-sm text-orange-ember italic mb-2">
        {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Unknown Date'}
      </p>
      <p className="text-sm text-orange-ember mb-2">{post.excerpt}</p>
      <div className="text-right">
        <Link href={`/blog/${post.slug}`} className="text-orange-300 text-sm hover:underline">
          Read more →
        </Link>
      </div>
    </div>
  );
}

