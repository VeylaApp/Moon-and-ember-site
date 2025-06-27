//Force users to login before accessing certain pages
// components/ProtectedRoute.js (or wherever this lives)
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase'; // ✅ use shared instance

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth');
      } else {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  if (loading) return <div className="text-white p-10">Checking access...</div>;

  return children;
}
