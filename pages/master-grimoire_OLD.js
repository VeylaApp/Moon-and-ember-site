import { useEffect, useState } from 'react';
import  supabase  from '@/lib/supabase';
import Layout from '@/components/Layout';
import { format } from 'date-fns';

export default function MasterGrimoire() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserAndEntries = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user_id = session?.user?.id;
      setUserId(user_id);

      const { data, error } = await supabase
        .from('cards')
        .select(`
          id,
          title,
          description,
          image_url,
          updated_at,
          category_id,
          user_id,
          categories:categories(id, name),
          profiles:profiles(id, username)
        `)
        .eq('is_master_grimoire', true)
        .eq('review_status', 'approved');

      if (error) {
        console.error('Error fetching approved cards:', error);
      } else {
        setEntries(data);
      }
      setLoading(false);
    };

    fetchUserAndEntries();
  }, []);

  const handleImport = async (entry) => {
    if (!userId) return;

    const { title, description, image_url, category_id } = entry;

    const { error } = await supabase.from('cards').insert({
      title,
      description,
      image_url,
      category_id,
      user_id: userId,
      is_master_grimoire: false,
      review_status: 'pending' // ensure it's one of your allowed values
    });

    if (error) {
      alert('Failed to import entry: ' + error.message);
    } else {
      alert('Entry successfully imported to your private cards.');
    }
  };

  if (loading) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6 text-white">
        <h1 className="text-4xl font-header text-orange-ember mb-8 text-center">Shared Master Grimoire</h1>
        {entries.length === 0 ? (
          <p className="text-center">No approved entries found.</p>
        ) : (
          <ul className="space-y-6">
            {entries.map((entry) => (
              <li key={entry.id} className="bg-black-veil p-4 rounded shadow flex items-start space-x-4">
                <img
                  src={entry.image_url || '/images/logo.jpg'}
                  alt={entry.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-header text-gold-aura mb-1">
                    {entry.categories?.name || 'Uncategorized'} - {entry.title}
                  </h2>
                  <p className="text-sm text-white/70 mb-1 italic">
                    By {entry.profiles?.username || 'Unknown'} • Updated {format(new Date(entry.updated_at), 'PPP')}
                  </p>
                  <p className="text-white text-sm mb-2">
                    {entry.description?.slice(0, 120)}{entry.description?.length > 120 ? '...' : ''}
                  </p>

                  {entry.user_id !== userId && (
                    <button
                      className="text-green-forest font-header text-sm hover:shadow-[0_0_10px_2px_#204e39] transition-shadow"
                      onClick={() => handleImport(entry)}
                    >
                      Import to My Grimoire
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
