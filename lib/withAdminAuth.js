// lib/withAdminAuth.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import  supabase  from '@/lib/supabase';

export default function withAdminAuth(WrappedComponent) {
  return function ProtectedAdminPage(props) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
      const checkAdminAccess = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const email = session?.user?.email;

        if (email === 'kellipinar@outlook.com') {
          setAuthorized(true);
        } else {
          router.replace('/auth'); // redirect non-admins
        }
      };

      checkAdminAccess();
    }, []);

    if (!authorized) {
      return <div className="text-center mt-12 text-white">Checking admin access...</div>;
    }

    return <WrappedComponent {...props} />;
  };
}
