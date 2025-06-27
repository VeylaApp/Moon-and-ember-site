// pages/edit-journal.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import supabase from '@/lib/supabase';

export default function EditJournalEntry() {
  const router = useRouter();
  const { id } = router.query;

  const [entry, setEntry] = useState(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchEntry = async () => {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          setError('Failed to load entry');
        } else {
          setEntry(data);
          setTitle(data.title);
          setDate(data.entry_date);
          setContent(data.content);
        }
      };
      fetchEntry();
    }
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const { error } = await supabase
      .from('journal_entries')
      .update({ title, entry_date: date, content })
      .eq('id', id);

    if (error) {
      setError('Failed to update entry.');
    } else {
      setMessage('Journal entry updated.');
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-header text-orange-ember mb-6">✏️ Edit Journal Entry</h1>
        {entry ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-ash-light mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 rounded bg-black/80 text-white border border-white/20"
                required
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
              <label className="block text-ash-light mb-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full p-3 rounded bg-black/80 text-white border border-white/20"
                required
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
        ) : (
          <p className="text-ash-light">Loading...</p>
        )}
      </div>
    </Layout>
  );
}
