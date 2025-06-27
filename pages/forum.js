// pages/forum/index.js
import { useEffect, useState } from 'react';
import  supabase  from '@/lib/supabase';
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function ForumHome() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('forum_categories').select('*');
      if (data) setCategories(data);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto mt-16 px-6 text-white">
        <h1 className="text-4xl font-bold text-orange-ember text-center mb-10 font-header tracking-wide">Moon & Embers Forum</h1>

        {loading ? (
          <p className="text-center">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-center">No categories found.</p>
        ) : (
          <div className="space-y-8">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-black-veil/70 p-6 rounded-xl shadow border border-white/10">
                <Link href={`/forum/category/${cat.slug}`} className="text-2xl text-orange-ember hover:underline font-semibold">
                  {cat.name}
                </Link>
                <p className="mt-2 text-ash-light">{cat.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
