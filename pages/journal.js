// pages/journal.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import  supabase  from '@/lib/supabase';

function JournalLandingPage() {
  const [username, setUsername] = useState('My');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsername = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();

      if (!error && data?.username) {
        setUsername(`${data.username}'s`);
      }

      setLoading(false);
    };

    fetchUsername();
  }, [router]);

  if (loading) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <div className="relative w-full min-h-screen bg-cover bg-center text-white"
        style={{
          backgroundImage: 'url("/images/journalcover.jpg")',
          backgroundSize: 'contain',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          height: 'auto',
        }}>
        <div className="absolute w-full text-center" style={{ top: '12%' }}>
          <h1 className="text-5xl font-header font-bold text-purple-moon text-center">
            {username}
          </h1>
          <h2 className="text-4xl font-header font-bold text-purple-moon mb-8 text-center">
            Journal
          </h2>

          <div className="flex flex-col items-center space-y-4 mt-[380px]">
            <button
              onClick={() => router.push('/createJournalEntry')}
              className="text-ash-light font-bold px-4 py-1 rounded-md font-header text-lg hover:shadow-[0_0_10px_2px_#204e39] transition-shadow duration-300"
            >
              Create Journal Entry
            </button>

            <button
              onClick={() => router.push('/viewJournalEntries')}
              className="text-ash-light font-bold px-4 py-1 rounded-md font-header text-lg hover:shadow-[0_0_10px_2px_#204e39] transition-shadow duration-300"
            >
              View/Edit Journal Entries
            </button>

            <button
              disabled
              className="text-ash-light font-bold px-4 py-1 rounded-md font-header text-lg opacity-50 cursor-not-allowed"
            >
              Create PDF (coming soon)
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function JournalPageWrapper() {
  return (
    <ProtectedRoute>
      <JournalLandingPage />
    </ProtectedRoute>
  );
}
