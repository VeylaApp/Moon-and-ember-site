import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import withAdminAuth from '@/lib/withAdminAuth';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

function ReviewSubmissions() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [notesMap, setNotesMap] = useState({});
  const [imageFiles, setImageFiles] = useState({});
  const [formState, setFormState] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: sessionData }, { data: catData }, { data: entriesData, error }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from('categories').select('id, name').order('name'),
        supabase
          .from('cards')
          .select(
            'id, title, description, tags, supplies, on_hand, private, is_master_grimoire, image_url, category_id, categories(name), review_notes, original_card_id, username'
          )
          .eq('private', false)
          .eq('review_status', 'pending')
          .eq('is_master_grimoire', true)
          .not('original_card_id', 'is', null),
      ]);

      setUserId(sessionData?.session?.user?.id || null);
      setCategories(catData || []);

      if (error) {
        console.error('Error fetching entries:', error);
      } else {
        const mappedFormState = {};
        const mappedNotes = {};
        entriesData.forEach((entry) => {
          mappedFormState[entry.id] = {
            title: entry.title,
            description: entry.description,
            tags: entry.tags,
            supplies: entry.supplies?.split(';') || [''],
            on_hand: entry.on_hand || false,
            isPrivate: entry.private,
            category_id: entry.category_id,
            image_url: entry.image_url || null,
          };
          mappedNotes[entry.id] = entry.review_notes || '';
        });
        setFormState(mappedFormState);
        setNotesMap(mappedNotes);
        setEntries(entriesData);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleChange = (id, field, value) => {
    setFormState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSupplyChange = (id, index, value) => {
    const supplies = [...formState[id].supplies];
    supplies[index] = value;
    handleChange(id, 'supplies', supplies);
  };

  const addSupplyField = (id) => {
    const supplies = [...formState[id].supplies, ''];
    handleChange(id, 'supplies', supplies);
  };

  const handleNoteChange = (id, value) => {
    setNotesMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (id, file) => {
    setImageFiles((prev) => ({ ...prev, [id]: file }));
  };

  const uploadImageIfNeeded = async (id) => {
    const file = imageFiles[id];
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Image upload failed:', uploadError);
      alert('Image upload failed');
      return null;
    }

    const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  };

  const updateReview = async (id, status) => {
    const notes = notesMap[id];
    if (!notes || notes.trim() === '') {
      alert('Review notes are required.');
      return;
    }

    const imageUrl = await uploadImageIfNeeded(id);
    const updated = formState[id];
    const supplyData = updated.supplies.filter(Boolean).join(';');

    const updateFields = {
      title: updated.title,
      description: updated.description,
      tags: updated.tags,
      on_hand: updated.on_hand,
      private: updated.isPrivate,
      is_master_grimoire: !updated.isPrivate,
      supplies: supplyData,
      category_id: updated.category_id,
      review_notes: notes,
      review_status: status,
      reviewed_by: userId,
    };

    if (imageUrl) updateFields.image_url = imageUrl;

    const { error } = await supabase.from('cards').update(updateFields).eq('id', id);

    if (error) {
      console.error(error);
      alert('Update failed.');
    } else {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  if (loading) return <AdminLayout>Loading...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="ml-52 pt-16 w-full max-w-3xl mx-auto p-6 text-white">
        <h1 className="text-3xl font-header text-orange-ember text-center mb-6">
          Master Grimoire Review Queue
        </h1>

        {entries.length === 0 ? (
          <p className="text-center">No pending entries.</p>
        ) : (
          entries.map((entry) => {
            const data = formState[entry.id];
            return (
              <div
                key={entry.id}
                className="bg-black-veil border border-white/10 p-6 mb-10 rounded-lg shadow-md"
              >
                {entry.username && (
                  <p className="mb-2 text-sm text-orange-ember">
                    Submitted by:{' '}
                    <Link
                      href={`/u/${entry.username}`}
                      className="underline hover:text-gold-aura"
                      target="_blank"
                    >
                      {entry.username}
                    </Link>
                  </p>
                )}

                {data.image_url && (
                  <img
                    src={data.image_url}
                    alt={data.title}
                    className="mb-4 rounded w-full max-h-64 object-cover"
                  />
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(entry.id, e.target.files[0])}
                  className="mb-4 block text-sm"
                />

                <input
                  type="text"
                  placeholder="Title"
                  className="w-full p-2 rounded bg-black-veil mb-3"
                  value={data.title}
                  onChange={(e) => handleChange(entry.id, 'title', e.target.value)}
                />

                <select
                  className="w-full p-2 rounded bg-black-veil mb-3"
                  value={data.category_id || ''}
                  onChange={(e) => handleChange(entry.id, 'category_id', e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <textarea
                  rows={5}
                  placeholder="Description"
                  className="w-full p-2 rounded bg-black-veil mb-3"
                  value={data.description}
                  onChange={(e) => handleChange(entry.id, 'description', e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  className="w-full p-2 rounded bg-black-veil mb-3"
                  value={data.tags}
                  onChange={(e) => handleChange(entry.id, 'tags', e.target.value)}
                />

                {entry.categories?.name === 'Spells and Rituals' && (
                  <div className="mb-4">
                    <label className="block text-sm mb-2">Supplies (up to 10)</label>
                    {data.supplies.map((supply, index) => (
                      <input
                        key={index}
                        type="text"
                        value={supply}
                        onChange={(e) => handleSupplyChange(entry.id, index, e.target.value)}
                        className="w-full mb-2 p-2 rounded bg-black-veil"
                        placeholder={`Supply ${index + 1}`}
                      />
                    ))}
                    {data.supplies.length < 10 && (
                      <button
                        type="button"
                        onClick={() => addSupplyField(entry.id)}
                        className="text-sm text-orange-ember hover:underline mt-2"
                      >
                        + Add Supply
                      </button>
                    )}
                  </div>
                )}

                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={data.on_hand}
                    onChange={() =>
                      handleChange(entry.id, 'on_hand', !data.on_hand)
                    }
                  />
                  <span>On Hand</span>
                </label>

                <label className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    checked={!data.isPrivate}
                    onChange={() =>
                      handleChange(entry.id, 'isPrivate', !data.isPrivate)
                    }
                  />
                  <span>Mark as Shared</span>
                </label>

                <textarea
                  className="w-full p-2 mb-4 rounded bg-white/10"
                  placeholder="Reviewer notes..."
                  value={notesMap[entry.id] || ''}
                  onChange={(e) => handleNoteChange(entry.id, e.target.value)}
                />

                <div className="flex space-x-4">
                  <button
                    onClick={() => updateReview(entry.id, 'approved')}
                    className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-white"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateReview(entry.id, 'rejected')}
                    className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-white"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(ReviewSubmissions);
