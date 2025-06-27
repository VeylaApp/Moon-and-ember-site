// pages/search.js
import { useState, useEffect } from 'react';
import  supabase  from '@/lib/supabase';
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function SearchCards() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [myEntriesOnly, setMyEntriesOnly] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Auth error:', error.message);
      } else {
        setUserId(data.session?.user?.id ?? null);
      }
    };

    loadUser();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);

    const q = `%${query.trim().toLowerCase()}%`;

    const { data, error } = await supabase
      .from('cards')
      .select(`
        id, title, description, supplies, tags, image_url,
        category_id, user_id, is_master_grimoire, review_status,
        categories(name), profiles(username, avatar_url)
      `)
      .or(`title.ilike.${q},description.ilike.${q},supplies.ilike.${q},tags.ilike.${q}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Search error:', error);
      setResults([]);
      setLoading(false);
      return;
    }

    const filtered = data.filter((card) => {
      const lowerQuery = query.toLowerCase();

      const baseMatch =
        [card.title, card.description, card.supplies, card.tags]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(lowerQuery);

      const categoryMatch = card.categories?.name?.toLowerCase().includes(lowerQuery);
      const userMatch = card.profiles?.username?.toLowerCase().includes(lowerQuery);

      if (!(baseMatch || categoryMatch || userMatch)) return false;

      const isMine = userId && card.user_id === userId;
      const isApprovedMaster =
        card.is_master_grimoire === true &&
        card.review_status?.toLowerCase() === 'approved';

      if (myEntriesOnly) return isMine;

      return isMine || isApprovedMaster;
    });

    setResults(filtered);
    setLoading(false);
  };

  const handleImport = async (entry) => {
    if (!userId) return;

    const { data: existing, error: dupError } = await supabase
      .from('cards')
      .select('id')
      .eq('user_id', userId)
      .ilike('title', entry.title);

    if (dupError) {
      alert('Error checking duplicates: ' + dupError.message);
      return;
    }

    if (existing.length > 0) {
      const confirmImport = confirm('You already have an entry with this title. Import anyway?');
      if (!confirmImport) return;
    }

    const { title, description, supplies, tags, image_url, category_id } = entry;

    const { error } = await supabase.from('cards').insert({
      title,
      description,
      supplies,
      tags,
      image_url,
      category_id,
      user_id: userId,
      is_master_grimoire: false,
      review_status: 'pending',
      private: true,
    });

    if (error) alert('Import failed: ' + error.message);
    else alert('Imported successfully');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 text-white">
        <h1 className="text-3xl font-header text-orange-ember text-center mb-6">
          Search All Grimoire Entries
        </h1>

        <form onSubmit={handleSearch} className="mb-6 space-y-2 flex">
          <input
            type="text"
            placeholder="Search title, tags, description, supplies, category, user…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-2 rounded bg-black-veil text-white"
          />
          <button
            type="submit"
            className="bg-orange-ember px-4 py-2 rounded font-bold text-white hover:bg-orange-600 transition"
          >
            Search
          </button>
        </form>

        <label className="flex items-center space-x-2 mb-4 text-sm">
          <input
            type="checkbox"
            checked={myEntriesOnly}
            onChange={() => setMyEntriesOnly(!myEntriesOnly)}
          />
          <span>Search only My Entries</span>
        </label>

        {loading && <p className="text-center">Searching...</p>}
        {results !== null && !loading && results.length === 0 && (
          <p className="text-center">No results found.</p>
        )}

        {results && results.length > 0 && (
          <ul className="space-y-4">
            {results.map((entry) => (
              <li
                key={entry.id}
                className="bg-black-veil p-4 rounded flex justify-between items-start"
              >
                <div className="flex-1">
                  <Link href={`/viewCard?id=${entry.id}`} target="_blank">
                    <span className="text-orange-ember font-header text-lg hover:underline cursor-pointer">
                      {entry.title}
                    </span>
                  </Link>
                  <p className="text-sm text-white/70 mt-1">
                    {entry.description?.slice(0, 100)}…
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-white/50 italic mt-2">
                    {entry.profiles?.avatar_url && (
                      <img
                        src={entry.profiles.avatar_url}
                        alt="avatar"
                        className="w-5 h-5 rounded-full border border-white/20"
                      />
                    )}
                    <Link
                      href={`/profile/view?id=${entry.user_id}`}
                      className="hover:underline text-white/70"
                      target="_blank"
                    >
                      {entry.profiles?.username || 'Unknown'}
                    </Link>
                  </div>
                </div>
                {entry.user_id !== userId && !myEntriesOnly && (
                  <button
                    className="text-green-forest font-header text-sm hover:shadow-[0_0_10px_2px_#204e39] transition-shadow"
                    onClick={() => handleImport(entry)}
                  >
                    Import (Premium)
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
