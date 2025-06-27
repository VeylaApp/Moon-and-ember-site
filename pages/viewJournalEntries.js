// pages/journal-entries.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import supabase from '@/lib/supabase';

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getSessionAndEntries = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      setSession(session);

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('entry_date', { ascending: false });

      if (error) {
        setError('Failed to load journal entries');
      } else {
        setEntries(data);
      }
      setLoading(false);
    };

    getSessionAndEntries();
  }, [router]);

  const handleDelete = async (id) => {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    if (!error) {
      setEntries(entries.filter((entry) => entry.id !== id));
    }
  };

  if (loading) return <p className="text-center text-ash-light p-6">Loading entries...</p>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-header text-orange-ember mb-6">📚 My Journal Entries</h1>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <ul className="space-y-6">
          {entries.map((entry) => (
            <li key={entry.id} className="bg-black/80 p-4 rounded border border-white/10 text-white">
              <h2 className="text-xl font-semibold">{entry.title}</h2>
              <p className="text-sm text-gray-400 mb-2">{entry.entry_date}</p>
              <p className="mb-4 whitespace-pre-line">{entry.content}</p>
              <div className="space-x-4">
                <button
                  className="text-blue-400 hover:underline"
                  onClick={() => router.push(`/editJournalEntry?id=${entry.id}`)}
                >
                  Edit
                </button>
                <button
                  className="text-red-400 hover:underline"
                  onClick={() => handleDelete(entry.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
