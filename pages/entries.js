import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabase';
import Layout from '@/components/Layout';
import { format } from 'date-fns';

const categoryIcons = {
  "Herbs and Flowers": "🌿",
  "Crystals and Stones": "💎",
  "Miscellaneous": "✨",
  "Candles": "🕯️",
  "Books": "📚",
  "Oils and Liquids": "🧺",
  "Spells and Rituals": "🪄",
  "Dieties": "🐈‍⬛",
  "Colors": "🎨",
  "Uncategorized": "🔮",
};

export default function ViewEntries() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [sortOption, setSortOption] = useState('title');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [initialSearch, setInitialSearch] = useState(true);
  const router = useRouter();
  const { query } = router;

  useEffect(() => {
    if (!router.isReady) return;

    const fetchEntries = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth');
        return;
      }

      setUserId(session.user.id);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      setUserRole(profileData?.role);

      if (!query.mode && !['admin', 'moderator'].includes(profileData?.role)) {
        router.replace('/');
        return;
      }

      if (query.mode !== 'search' || (query.mode === 'search' && query.q)) {
        let supabaseQuery = supabase
          .from('cards')
          .select(`id, title, description, image_url, updated_at, category_id, user_id, private, is_master_grimoire, review_status, categories(id, name), profiles(id, username, avatar_url), supplies, tags`);

        if (query.mode === 'master') {
          supabaseQuery = supabaseQuery.eq('is_master_grimoire', true).eq('review_status', 'approved');
        } else if (query.mode === 'my') {
          supabaseQuery = supabaseQuery.eq('user_id', session.user.id).eq('is_master_grimoire', false);
        } else if (query.mode === 'search' && query.q) {
          const searchTerm = `%${query.q}%`;
          supabaseQuery = supabaseQuery.ilike('supplies', searchTerm);
          setSearchInput(query.q);
          setInitialSearch(false);
        }

        const { data, error } = await supabaseQuery;
        if (error) {
          console.error('Error fetching cards:', error);
        } else {
          setEntries(data);
        }
      }

      setLoading(false);
    };

    fetchEntries();
  }, [router.isReady, router]);

  const allCategories = [...new Set(entries.map(card => (card.categories?.name || 'Uncategorized').trim()))];

  const handleCategoryToggle = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSelectAll = () => setSelectedCategories(allCategories);
  const handleSelectNone = () => setSelectedCategories([]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.push(`/entries?mode=search&q=${encodeURIComponent(searchInput)}`);
  };

  const handleImport = async (card) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from('cards').insert({
      user_id: session.user.id,
      title: card.title,
      description: card.description,
      tags: card.tags,
      image_url: card.image_url,
      category_id: card.category_id,
      supplies: card.supplies,
      private: true,
      is_master_grimoire: false,
      on_hand: null,
    });

    if (error) alert('Failed to import entry.');
    else alert('Entry imported to your Grimoire!');
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

  if (loading) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <div className="min-h-screen bg-cover bg-center bg-no-repeat p-8 text-white"
>
        <div className="max-w-xl mx-auto p-6 rounded-lg backdrop-blur-md">
          <h1 className="text-3xl font-header text-orange-ember mb-6 text-center">
            {query.mode === 'master' ? 'Shared Master Grimoire'
              : query.mode === 'my' ? 'Your Entries'
              : query.mode === 'search' ? `Search Results for "${query.q || ''}"`
              : 'All Entries (Admin View)'}
          </h1>

          {(query.mode !== 'search' || !initialSearch) && (
            <>
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
                        <h2 className="text-xl font-header text-gold-aura mb-1 flex flex-wrap items-center gap-2">
                          {categoryIcons[card.categories?.name?.trim()] || '📦'}
                          <span>{card.categories?.name || 'Uncategorized'} - {card.title}</span>
                          {card.categories?.name?.trim() !== 'Spells and Rituals' && (
                            <a
                              href={`/entries?mode=search&q=${encodeURIComponent(card.title)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-ash-light underline hover:text-orange-ember ml-2"
                              title={`Search spells and rituals related to \"${card.title}\"`}
                            >
                              Search for spells
                            </a>
                          )}
                        </h2>
                        <p className="text-sm text-white/70 mb-1 italic flex items-center gap-2">
                          {card.profiles?.avatar_url && (
                            <img
                              src={card.profiles.avatar_url}
                              alt="avatar"
                              className="w-6 h-6 rounded-full border border-white"
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
                              className="text-green-400 hover:underline"
                            >
                              Import (premium)
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
