// pages/createJournalEntry.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import supabase from '@/lib/supabase';

export default function CreateJournalEntry() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);

      if (!session) {
        router.push('/auth');
      }
    };

    getSession();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const { error } = await supabase.from('journal_entries').insert([
      {
        title,
        entry_date: date,
        content,
        category: null,
        attachments: null,
        user_id: session?.user?.id,
      },
    ]);

    if (error) {
      setError('Error saving journal entry.');
    } else {
      setMessage('Journal entry saved successfully!');
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setContent('');
    }
  };

  if (loading) return <p className="text-center text-ash-light p-6">Checking authentication...</p>;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-header text-orange-ember mb-6">📝 Journal Entry</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-ash-light mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-2 rounded bg-black/80 text-white border border-white/20"
            />
          </div>

          <div>
            <label className="block text-ash-light mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 rounded bg-black/80 text-white border border-white/20"
            />
          </div>

          <div>
            <label className="block text-ash-light mb-1">Entry</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              required
              className="w-full p-3 rounded bg-black/80 text-white border border-white/20"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              type="submit"
              className="bg-green-700 text-white px-4 py-2 rounded hover:shadow-[0_0_10px_2px_#204e39]"
            >
              Save Entry
            </button>

            <button
              type="button"
              onClick={() => router.push('/viewJournalEntries')}
              className="bg-green-700 text-white px-4 py-2 rounded hover:shadow-[0_0_10px_2px_#204e39]"
            >
              View All Entries
            </button>
          </div>

          {message && <p className="text-green-400 mt-2">{message}</p>}
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </form>
      </div>
    </Layout>
  );
}
