// pages/admin/review-submissions.js
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import withAdminAuth from '@/lib/withAdminAuth';

function ReviewSubmissions() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [notesMap, setNotesMap] = useState({});

  useEffect(() => {
    const fetchSubmissions = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setUserId(sessionData?.session?.user?.id || null);

      const { data, error } = await supabase
        .from('cards')
        .select('id, title, description, categories(name), review_status, review_notes')
        .eq('private', false)
        .eq('review_status', 'pending');

      if (error) {
        console.error('Error fetching submissions:', error);
      } else {
        setEntries(data);
        const initialNotes = {};
        data.forEach(entry => {
          initialNotes[entry.id] = entry.review_notes || '';
        });
        setNotesMap(initialNotes);
      }
      setLoading(false);
    };

    fetchSubmissions();
  }, []);

  const updateReview = async (id, status) => {
    const notes = notesMap[id];
    if (!notes || notes.trim() === '') {
      alert('Review notes are required.');
      return;
    }

    const { error } = await supabase
      .from('cards')
      .update({ review_status: status, review_notes: notes, reviewed_by: userId })
      .eq('id', id);

    if (error) {
      alert('Update failed.');
    } else {
      setEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const handleNoteChange = (id, value) => {
    setNotesMap(prev => ({ ...prev, [id]: value }));
  };

  if (loading) return <AdminLayout>Loading...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="ml-52 pt-16 w-full max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-header text-orange-ember text-center mb-6">
          Master Grimoire Review Queue
        </h1>

        {entries.length === 0 ? (
          <p className="text-center text-white">No pending entries.</p>
        ) : (
          <ul className="space-y-6">
            {entries.map(({ id, title, description, categories }) => (
              <li key={id} className="bg-black-veil p-4 rounded shadow text-white">
                <h2 className="text-xl font-header text-gold-aura mb-2">{title}</h2>
                <p className="mb-2 text-sm italic text-orange-ember">Category: {categories?.name || 'Uncategorized'}</p>
                <p className="mb-4">{description}</p>

                <textarea
                  className="w-full p-2 mb-4 rounded bg-white/10 text-white"
                  placeholder="Enter reviewer notes..."
                  value={notesMap[id] || ''}
                  onChange={(e) => handleNoteChange(id, e.target.value)}
                  required
                />

                <div className="flex space-x-4">
                  <button
                    onClick={() => updateReview(id, 'approved')}
                    className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-white"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateReview(id, 'rejected')}
                    className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-white"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(ReviewSubmissions);
