import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Look for token in URL
    const { access_token, refresh_token } = router.query;

    if (access_token && refresh_token) {
      // If tokens exist, set the session
      supabase.auth.setSession({
        access_token,
        refresh_token
      }).then(() => {
        // Redirect to dashboard after login
        router.replace('/dashboard');
      });
    }
  }, [router]);

  return (
    <main>
      <h1>Welcome to Moon and Ember</h1>
      <p>This is the beginning of your sacred digital space.</p>
      <a href="/login">Enter the Circle</a>
    </main>
  );
}
