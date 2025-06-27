//navigation for clicking into individual blog posts
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BlogSidebar() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      const today = new Date().toISOString();
      const url = `https://bohmreonbrxneehnqvku.supabase.co/rest/v1/blog_posts?select=title,slug,published_at,cover_image_url&status=eq.published&published_at=lte.${today}&order=published_at.desc.nullslast&limit=4`;

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
        console.error('Failed to fetch sidebar posts:', err);
      }
    }

    fetchPosts();
  }, []);

  return (
    <aside className="bg-black/30 border border-white/10 rounded-xl p-4 w-full md:w-64 mt-10 md:mt-0 text-white">
      <h3 className="text-lg font-semibold text-orange-ember mb-4">🧾 Recent Posts</h3>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.slug} className="flex items-start gap-3">
            {post.cover_image_url && (
              <img
                src={post.cover_image_url.startsWith('/')
                  ? `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${post.cover_image_url}`
                  : post.cover_image_url}
                alt=""
                className="w-12 h-12 object-cover rounded"
              />
            )}
            <div>
              <Link href={`/blog/${post.slug}`} className="text-sm text-orange-300 hover:underline">
                {post.title}
              </Link>
              <p className="text-xs text-ash-light italic">
                {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
