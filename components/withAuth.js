// components/withAuth.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import  supabase  from '@/lib/supabase';

export default function withAuth(Component) {
  return function ProtectedPage(props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkSession = async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          router.push('/auth');
        } else {
          setLoading(false);
        }
      };

      checkSession();

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) router.push('/auth');
      });

      return () => listener?.subscription.unsubscribe();
    }, [router]);

    if (loading) {
      return <p className="text-center text-white mt-10">🔐 Loading protected content...</p>;
    }

    return <Component {...props} />;
  };
}
