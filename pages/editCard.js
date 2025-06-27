import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import  supabase  from '@/lib/supabase';
import Layout from '@/components/Layout';
import { v4 as uuidv4 } from 'uuid';

export default function EditEntry() {
  const router = useRouter();
  const { id } = router.query;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [supplies, setSupplies] = useState(['']);
  const [isPrivate, setIsPrivate] = useState(true);
  const [onHand, setOnHand] = useState(false);
  const [categoryId, setCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isSpellsCategory, setIsSpellsCategory] = useState(false);
  const [isMaster, setIsMaster] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchCard = async () => {
      const { data, error } = await supabase
        .from('cards')
        .select('title, description, tags, image_url, supplies, on_hand, private, is_master_grimoire, category_id, categories(name)')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching entry:', error);
        return;
      }

      setTitle(data.title);
      setDescription(data.description || '');
      setTags(data.tags || '');
      setImageUrl(data.image_url || '');
      setSupplies(data.supplies ? data.supplies.split(';') : ['']);
      setOnHand(data.on_hand || false);
      setIsPrivate(data.private);
      setCategoryId(data.category_id);
      setIsSpellsCategory(data.categories?.name === 'Spells and Rituals');
      setIsMaster(data.is_master_grimoire);
    };

    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('id, name');
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data);
      }
    };

    fetchCard();
    fetchCategories();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isMaster) {
      alert('You cannot edit a Shared Master Grimoire entry.');
      return;
    }

    if (!title || !categoryId) return alert('Title and Category are required.');

    const supplyData = isSpellsCategory ? supplies.filter(Boolean).join(';') : null;

    let finalImageUrl = imageUrl;

    if (image) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;

      if (imageUrl) {
        const oldPath = imageUrl.split('/').pop();
        await supabase.storage.from('images').remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, image);

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        alert('Image upload failed.');
        return;
      }

      const { data: publicUrlData } = supabase
        .storage
        .from('images')
        .getPublicUrl(fileName);

      finalImageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from('cards')
      .update({
        title,
        description,
        tags,
        image_url: finalImageUrl,
        on_hand: !isSpellsCategory ? onHand : null,
        supplies: isSpellsCategory ? supplyData : null,
        private: isPrivate,
        category_id: categoryId,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating entry:', error);
      alert('Failed to update entry.');
    } else {
      window.open(`/viewCard?id=${id}`, '_blank');
    }
  };

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
            Edit Entry: {title || 'Loading...'}
          </h1>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 rounded bg-black-veil text-white"
              />
            </div>

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

            <div>
              <label className="block text-sm mb-2">Description</label>
              <textarea
                rows={9}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 rounded bg-black-veil text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-2 rounded bg-black-veil text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Image Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="block text-sm text-ash-light"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2 rounded bg-black-veil text-white"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

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

            <button
              type="submit"
              className="px-6 py-2 font-header font-bold text-lg text-ash-light hover:shadow-[0_0_10px_2px_#204e39] transition-shadow rounded"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
