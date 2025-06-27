// pages/admin/view-all.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import withAdminAuth from '@/lib/withAdminAuth';
import { format } from 'date-fns';

const categoryIcons = {
  "Herbs and Flowers": "🌿",
  "Crystals and Stones": "💎",
  "Miscellaneous": "✨",
  "Candles": "🕯️",
  "Books": "📚",
  "Oils and Liquids": "🧪",
  "Spells and Rituals": "🪄",
  "Dieties": "🐈‍⬛",
  "Colors": "🎨",
  "Uncategorized": "🔮",
};

function ViewEntries() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [sortOption, setSortOption] = useState('title');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEntries = async () => {
      const sessionResult = await supabase.auth.getSession();
      console.log("Session result:", sessionResult);

      const session = sessionResult.data.session;
      if (!session) {
        console.log("No session, redirecting to /auth");
        router.replace('/auth');
        return;
      }

      setUserId(session.user.id);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !['admin', 'moderator'].includes(profileData?.role)) {
        router.replace('/');
        return;
      }

      const { data, error } = await supabase
        .from('cards')
        .select(`id, title, description, image_url, updated_at, category_id, user_id, private, is_master_grimoire, review_status, categories(id, name), profiles(id, username, avatar_url)`);

      if (error) {
        console.error('Error fetching cards:', error);
      } else {
        setEntries(data);
      }
      setLoading(false);
    };

    fetchEntries();
  }, [router]);

  const allCategories = [...new Set(entries.map(card => (card.categories?.name || 'Uncategorized').trim()))];

  const handleCategoryToggle = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSelectAll = () => setSelectedCategories(allCategories);
  const handleSelectNone = () => setSelectedCategories([]);

  const handleImport = async (entry) => {
    if (!userId) return;

    const { title, description, image_url, category_id } = entry;
    const { error } = await supabase.from('cards').insert({
      title,
      description,
      image_url,
      category_id,
      user_id: userId,
      private: true,
      is_master_grimoire: false,
    });

    if (error) {
      alert('Failed to import entry: ' + error.message);
    } else {
      alert('Entry successfully imported to your private cards.');
    }
  };

  const filteredEntries = selectedCategories.length > 0
    ? entries.filter(c => selectedCategories.includes((c.categories?.name || 'Uncategorized').trim()))
    : entries;

  const sortedEntries = () => {
    if (sortOption === 'title') {
      return [...filteredEntries].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortOption === 'category') {
      return [...filteredEntries].sort((a, b) => {
        const aCat = (a.categories?.name || 'Uncategorized').trim();
        const bCat = (b.categories?.name || 'Uncategorized').trim();
        return aCat.localeCompare(bCat);
      });
    }
    return filteredEntries;
  };

  if (loading) return <AdminLayout>Loading...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="ml-52 pt-16 w-full max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-header text-orange-ember mb-6 text-center">
          All Entries (Admin View)
        </h1>

        <div className="mb-6 bg-white/10 p-4 rounded shadow">
          <div className="mb-4">
            <label className="font-header mr-4">Sort By:</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-black-veil text-white p-2 rounded"
            >
              <option value="title">Title</option>
              <option value="category">Category</option>
            </select>
          </div>

          <div className="flex justify-between items-center mb-2">
            <p className="font-header">Filter by Category:</p>
            <div className="space-x-2 text-sm">
              <button onClick={handleSelectAll} className="underline hover:text-orange-ember">Select All</button>
              <button onClick={handleSelectNone} className="underline hover:text-orange-ember">Select None</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            {allCategories.map(cat => (
              <label key={cat} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => handleCategoryToggle(cat)}
                />
                <span>{categoryIcons[cat] || '📦'} {cat}</span>
              </label>
            ))}
          </div>
        </div>

        {sortedEntries().length === 0 ? (
          <p className="text-center text-ash-light">No entries found.</p>
        ) : (
          <ul className="space-y-6">
            {sortedEntries().map((card) => (
              <li key={card.id} className="bg-black-veil p-4 rounded shadow flex items-start space-x-4">
                <img
                  src={card.image_url || '/images/logo.jpg'}
                  alt={card.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-header text-gold-aura mb-1">
                    {categoryIcons[card.categories?.name?.trim()] || '📦'} {card.categories?.name || 'Uncategorized'} - {card.title}
                  </h2>
                  <p className="text-sm text-white/70 mb-1 italic flex items-center gap-2">
                    {card.profiles?.avatar_url && (
                      <img
                        src={card.profiles.avatar_url}
                        alt="avatar"
                        className="w-6 h-6 rounded-full border border-white"
                        onError={(e) => e.currentTarget.src = '/images/logo.jpg'}
                      />
                    )}
                    <span>By {card.profiles?.username || 'Unknown'} • Updated {format(new Date(card.updated_at), 'PPP')}</span>
                  </p>
                  <p className="text-white text-sm mb-2">
                    {card.description?.slice(0, 120)}{card.description?.length > 120 ? '...' : ''}
                  </p>

                  <div className="flex gap-4 text-sm">
                    <a
                      href={`/viewCard?id=${card.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ash-light underline hover:text-orange-ember"
                    >
                      View
                    </a>
                    {card.user_id === userId && (
                      <a
                        href={`/editCard?id=${card.id}`}
                        className="text-orange-ember hover:underline"
                      >
                        Edit
                      </a>
                    )}
                    {card.is_master_grimoire && card.user_id !== userId && (
                      <button
                        onClick={() => handleImport(card)}
                        className="text-green-forest font-header hover:shadow-[0_0_10px_2px_#204e39] transition-shadow"
                      >
                        Import to My Grimoire
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(ViewEntries);
