import { useEffect } from 'react';
import  supabase  from '@/lib/supabase';
import { useRouter } from 'next/router';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      await supabase.auth.signOut();
      router.push('/');
    };
    doLogout();
  }, [router]);

  return <p>Logging out...</p>;
}