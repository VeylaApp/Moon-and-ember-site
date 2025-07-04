import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import supabase from '@/lib/supabase';

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
      <div
        className="relative w-full min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: 'url("/images/cover.png")',
          backgroundSize: 'contain',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Soft Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center px-4 pt-12 sm:pt-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-header font-bold text-purple-moon">{username}</h1>
          <h2 className="text-2xl sm:text-4xl font-header font-bold text-purple-moon mt-2 mb-20">Journal</h2>

          <div className="w-full max-w-md space-y-5 font-header">
            <button
              onClick={() => router.push('/createJournalEntry')}
              className="btn-primary w-full text-xl py-3"
            >
              Create Journal Entry
            </button>

            <button
              onClick={() => router.push('/viewJournalEntries')}
              className="btn-primary w-full text-xl py-3"
            >
              View/Edit Journal Entries
            </button>

            <button
              disabled
              className="btn-primary w-full text-xl py-3 opacity-50 cursor-not-allowed"
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
