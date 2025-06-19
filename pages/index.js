import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';
import Layout from '../components/Layout'; // 👈 Import Layout

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const { access_token, refresh_token } = router.query;

    if (access_token && refresh_token) {
      supabase.auth.setSession({
        access_token,
        refresh_token
      }).then(() => {
        router.replace('/dashboard');
      });
    }
  }, [router]);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-2">Welcome to Moon and Ember</h1>
      <p className="mb-4">This is the beginning of your sacred digital space.</p>
      <a href="/login" className="text-blue-400 underline">Enter the Circle</a>
    </Layout>
  );
}
