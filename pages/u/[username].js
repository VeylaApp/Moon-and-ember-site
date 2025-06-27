import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import  supabase  from '@/lib/supabase';
import Layout from '@/components/Layout';

export default function PublicUserProfile() {
  const router = useRouter();
  const { username } = router.query;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Profile fetch error:', error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return <Layout><div className="text-center text-white mt-20">Loading profile...</div></Layout>;
  }

  if (!profile) {
    return <Layout><div className="text-center text-white mt-20">User not found.</div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto p-8 bg-black-veil/80 border border-white/10 backdrop-blur-md rounded-2xl mt-20 shadow-xl text-white text-center">
        <h1 className="text-4xl font-bold mb-6 text-orange-ember font-header tracking-wide">{profile.username}</h1>

        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            className="mx-auto h-32 w-32 rounded-full object-cover border-2 border-orange-ember shadow mb-4"
          />
        ) : (
          <div className="h-32 w-32 mx-auto rounded-full bg-slate-700 flex items-center justify-center text-ash-light mb-4">
            No Avatar
          </div>
        )}

        <div className="space-y-2 text-left">
          {profile.first_name && <p><span className="font-semibold text-orange-ember">First Name:</span> {profile.first_name}</p>}
          {profile.location && <p><span className="font-semibold text-orange-ember">Location:</span> {profile.location}</p>}
          {profile.share_birthday && profile.birthday && (
            <p><span className="font-semibold text-orange-ember">Birthday:</span> {new Date(profile.birthday).toLocaleDateString()}</p>
          )}
        </div>

        <div className="flex justify-center mt-6 space-x-4 text-2xl">
          {profile.sun_sign && <span title="Sun Sign">♈ {profile.sun_sign}</span>}
          {profile.moon_sign && <span title="Moon Sign">🌙 {profile.moon_sign}</span>}
          {profile.rising_sign && <span title="Rising Sign">🌅 {profile.rising_sign}</span>}
        </div>
      </div>
    </Layout>
  );
}
