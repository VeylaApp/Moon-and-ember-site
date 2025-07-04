import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabase';

export default function withAdminAuth(WrappedComponent) {
  return function ProtectedAdminPage(props) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      const checkAdminAccess = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!session || error) {
          router.replace('/auth');
          return;
        }

        const userId = session.user.id;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (profile?.role === 'admin') {
          setAuthorized(true);
        } else {
          router.replace('/auth');
        }

        setChecking(false);
      };

      checkAdminAccess();
    }, [router]);

    if (checking) {
      return <div className="text-center mt-12 text-white">Checking admin access...</div>;
    }

    if (!authorized) return null;

    return <WrappedComponent {...props} />;
  };
}
