// /pages/createCard.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import  supabase  from '@/lib/supabase';
import Layout from '@/components/Layout';
import { v4 as uuidv4 } from 'uuid';

export default function CreateCard() {
  const router = useRouter();
  const { category } = router.query;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState(null);
  const [isPrivate, setIsPrivate] = useState(true);
  const [onHand, setOnHand] = useState(false);
  const [supplies, setSupplies] = useState(['']);
  const [showSharedReminder, setShowSharedReminder] = useState(false);
  const [categoryId, setCategoryId] = useState(null);

  const decodedCategory = decodeURIComponent(category || '');
  const isSpellsCategory = decodedCategory === 'Spells and Rituals';

  useEffect(() => {
    if (!router.isReady || !category) return;

    const fetchCategoryId = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', decodedCategory)
        .maybeSingle();

      if (error) {
        console.error('Error fetching category ID:', error);
      } else {
        setCategoryId(data?.id || null);
      }
    };

    fetchCategoryId();
  }, [router.isReady, category]);

  const handleSubmit = async (e, redirectToView = true) => {
    e.preventDefault();

    if (!title) return alert('Title is required');
    if (!categoryId) return alert('Category not found.');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('You must be logged in to create a card');
      return;
    }

    const { data: duplicate, error: dupError } = await supabase
      .from('cards')
      .select('id')
      .eq('user_id', session.user.id)
      .ilike('title', title);

    if (dupError) {
      alert('Error checking for duplicates.');
      return;
    }

    if (duplicate.length > 0) {
      const confirmProceed = confirm('You already have a card with this title. Create anyway?');
      if (!confirmProceed) return;
    }

    let imageUrl = null;

    if (image) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, image);

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        alert('Image upload failed.');
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
    }

    const supplyData = isSpellsCategory ? supplies.filter(Boolean).join(';') : null;

    const { data: newCard, error } = await supabase
      .from('cards')
      .insert({
        user_id: session.user.id,
        category_id: categoryId,
        title,
        description,
        tags,
        image_url: imageUrl,
        on_hand: !isSpellsCategory ? onHand : null,
        supplies: supplyData,
        private: isPrivate,
         is_master_grimoire: !isPrivate,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving card:', error);
      alert('Something went wrong.');
      return;
    }

    if (!isPrivate) {
      setShowSharedReminder(true);
    } else if (redirectToView) {
      router.push(`/viewCard?id=${newCard.id}`);
    } else {
      router.push('/grimoire');
      setTimeout(() => {
        const event = new CustomEvent('triggerCategoryModal');
        window.dispatchEvent(event);
      }, 200);
    }
  };

  if (!router.isReady) return null;

  return (
    <Layout>
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat p-8 text-white"
        style={{
          backgroundImage: 'url("/images/page.png")',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'rgba(0,0,0,0.6)',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="max-w-xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-header text-orange-ember mb-6 text-center">
            Create a New {decodedCategory} Entry
          </h1>

          <form className="space-y-4" onSubmit={(e) => handleSubmit(e, true)}>
            <input
              type="text"
              placeholder="Title"
              className="w-full p-2 rounded bg-black-veil text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {isSpellsCategory && (
              <div>
                <label className="block text-sm mb-2">Supplies (up to 10)</label>
                {supplies.map((supply, index) => (
                  <input
                    key={index}
                    type="text"
                    value={supply}
                    onChange={(e) => {
                      const updated = [...supplies];
                      updated[index] = e.target.value;
                      setSupplies(updated);
                    }}
                    className="w-full mb-2 p-2 rounded bg-black-veil text-white"
                    placeholder={`Supply ${index + 1}`}
                  />
                ))}
                {supplies.length < 10 && (
                  <button
                    type="button"
                    onClick={() => setSupplies([...supplies, ''])}
                    className="text-sm text-orange-ember hover:underline mt-2"
                  >
                    + Add Supply
                  </button>
                )}
              </div>
            )}

            <textarea
              placeholder="Description"
              className="w-full p-2 rounded bg-black-veil text-white"
              rows={9}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              type="text"
              placeholder="Tags (comma separated)"
              className="w-full p-2 rounded bg-black-veil text-white"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />

            <input
              type="file"
              accept="image/*"
              className="block text-sm text-ash-light"
              onChange={(e) => setImage(e.target.files[0])}
            />

            {!isSpellsCategory && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={onHand}
                  onChange={() => setOnHand(!onHand)}
                />
                <span>On Hand</span>
              </label>
            )}

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!isPrivate}
                onChange={() => setIsPrivate(!isPrivate)}
              />
              <span>Mark as Shared</span>
            </label>

            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <button
                type="submit"
                className="px-6 py-2 font-header font-bold text-lg text-ash-light hover:shadow-[0_0_10px_2px_#204e39] transition-shadow rounded"
              >
                Save Entry
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                className="px-6 py-2 font-header font-bold text-lg text-ash-light hover:shadow-[0_0_10px_2px_#204e39] transition-shadow rounded"
              >
                Save & Create Another
              </button>
            </div>
          </form>

          {showSharedReminder && (
            <div className="mt-6 bg-orange-ember/90 text-white p-4 rounded shadow-md text-center">
              <p className="mb-2 font-bold">
                This card has been marked shared and will be submitted to the master grimoire for review by admins.
              </p>
              <button
                onClick={() => router.push('/grimoire')}
                className="text-white underline"
              >
                OK, return to Grimoire
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
