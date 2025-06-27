import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabase';
import Layout from '@/components/Layout';

export default function Grimoire() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ username: 'Username', title: 'Grimoire' });
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showRedirectNotice, setShowRedirectNotice] = useState(false);
  const router = useRouter();

  const REQUIRED_FIELDS = ['username', 'first_name', 'last_name'];

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Session:', session);

        if (sessionError || !session) {
          console.warn('No session found. Redirecting...');
          router.replace('/auth');
          return;
        }

        const userId = session.user.id;
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, first_name, last_name, book_title')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            localStorage.setItem('incompleteProfileRedirect', 'true');
            router.replace('/profile');
            return;
          }
          console.error('Profile fetch error:', error);
          setLoading(false);
          return;
        }

        const missingFields = REQUIRED_FIELDS.some(field => !data?.[field]);
        if (missingFields) {
          localStorage.setItem('incompleteProfileRedirect', 'true');
          router.replace('/profile');
          return;
        }

        setUserData({
          username: `${data.username}'s`,
          title: data.book_title || 'Grimoire',
        });
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('name');
      if (error) console.error('Error fetching categories:', error);
      else setCategories(data.map(cat => cat.name));
    };

    init();
    fetchCategories();

    const handleTrigger = () => setShowModal(true);
    window.addEventListener('triggerCategoryModal', handleTrigger);
    return () => window.removeEventListener('triggerCategoryModal', handleTrigger);
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shouldShow = localStorage.getItem('incompleteProfileRedirect');
      if (shouldShow) {
        setShowRedirectNotice(true);
        localStorage.removeItem('incompleteProfileRedirect');
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowRedirectNotice(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCategorySelect = (category) => {
    setShowModal(false);
    router.push(`/createCard?category=${category}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center text-white font-header">Loading Grimoire...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative w-full min-h-screen bg-cover bg-center text-white"
        style={{
          backgroundImage: 'url("/images/cover.png")',
          backgroundSize: 'contain',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}>
        <div className="absolute w-full text-center" style={{ top: '8%' }}>
          <h1 className="text-5xl font-header font-bold text-purple-moon">{userData.username}</h1>
          <h2 className="text-4xl font-header font-bold text-purple-moon mb-8">{userData.title}</h2>

          <div className="text-5x1 flex flex-col font-header items-center space-y-6 mt-[380px]">
            <button onClick={() => setShowModal(true)} className="btn-primary">Create new entry</button>
            <button onClick={() => router.push('/inventory')} className="btn-primary">View my inventory</button>
            <button onClick={() => router.push('/entries?mode=my')} className="btn-primary">View My Entries</button>
            <button onClick={() => router.push('/entries?mode=master')} className="btn-primary">View Master Grimoire</button>
            <button onClick={() => router.push('/search')} className="btn-primary">Search Entries</button>
            <button disabled className="btn-primary opacity-75 cursor-not-allowed">View your Shopping List (coming soon)</button>
            <button disabled className="btn-primary opacity-75 cursor-not-allowed">Create PDF (coming soon)</button>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-ash-light rounded-lg shadow-xl p-6 max-w-md w-full text-center">
              <h2 className="text-xl font-header mb-4 text-purple-moon">Select a category</h2>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className="block w-full text-green-forest font-header text-lg hover:shadow-[0_0_10px_2px_#204e39] transition-shadow duration-300"
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowModal(false)} className="mt-6 text-sm text-gray-500 hover:underline">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
