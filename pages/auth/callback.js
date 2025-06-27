import { useEffect } from 'react';
import { useRouter } from 'next/router';
import  supabase  from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const processCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/auth'); // fallback if session didn't restore
        return;
      }

      const { id, email } = session.user;

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', id)
        .single();

      if (!existingProfile) {
        // Insert basic profile (username will need collected separately if not passed before)
        await supabase.from('profiles').insert({
          id,
          email,
          role: 'free_user'
        });
      }

      router.push('/grimoire'); // redirect to actual content
    };

    processCallback();
  }, []);

  return (
    <p className="text-center text-white mt-20">Finishing sign-up... Please wait.</p>
  );
}
