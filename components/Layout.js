import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabase'; // ✅ use shared instance

export default function Layout({ children }) {
  const [session, setSession] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadSessionAndAvatar = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single();

        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      }
    };

    loadSessionAndAvatar();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-black-veil text-ash-light font-body relative overflow-hidden">
      {/* Fullscreen Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/mystic-forest.jpg')" }}
      />

      {/* Color Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-moon/70 via-black-veil/80 to-green-forest/70 z-10" />

      {/* Content with Nav */}
      <div className="relative z-20 min-h-screen">
        <header className="fixed top-0 left-0 w-full bg-black-veil/80 z-50 border-b border-purple-moon">
          <nav className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-lg font-header text-ash-light">
              <Link href="/">Home</Link>
              <Link href="/grimoire">Grimoire</Link>
              <Link href="/journal">Journal</Link>
              <Link href="/forum">Forum</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>

              {session ? (
                <div className="flex items-center space-x-3 ml-4">
                  <button
                    onClick={handleSignOut}
                    className="text-sm bg-orange-ember text-white px-3 py-1 rounded hover:bg-orange-600"
                  >
                    Sign Out
                  </button>
                  <Link href="/profile">
                    <img
                      src={avatarUrl || '/images/default-avatar.png'}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border-2 border-orange-ember hover:shadow-[0_0_10px_2px_#204e39] transition-all cursor-pointer object-cover"
                    />
                  </Link>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="ml-4 text-sm bg-orange-ember text-white px-3 py-1 rounded hover:bg-orange-600"
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </header>

        <main className="pt-28 px-4 pb-10">{children}</main>
      </div>
    </div>
  );
}
