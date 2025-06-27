import { useEffect, useState } from 'react';
import  supabase  from '@/lib/supabase';
import Layout from '@/components/Layout';

export default function PublicProfileView() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const userId = params.get('id');

        console.log('Extracted ID from URL:', userId);
        if (!userId) {
          setErrorMsg('No ID in URL.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          setErrorMsg('Supabase query failed: ' + error.message);
          setProfile(null);
        } else if (!data) {
          console.warn('No profile data returned.');
          setErrorMsg('No profile returned from Supabase.');
          setProfile(null);
        } else {
          console.log('Profile found:', data);
          setProfile(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setErrorMsg('Unexpected error occurred.');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      fetchProfile();
    }
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="text-center text-white mt-8">Loading profile...</div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="text-center text-white mt-8">No profile found for that user ID.</div>
        {errorMsg && <p className="text-red-400 text-center mt-4">{errorMsg}</p>}
      </Layout>
    );
  }

  const avatarUrl = profile.avatar_url || '/images/default-avatar.png';
  const birthdayParts = profile.birthday?.split('-');
  const formattedBirthday = birthdayParts
    ? `${parseInt(birthdayParts[1], 10)}/${parseInt(birthdayParts[2], 10)}`
    : '';

  return (
    <Layout>
      <div className="max-w-xl mx-auto p-8 bg-black-veil/80 border border-white/10 backdrop-blur-md rounded-2xl mt-8 shadow-xl text-white text-center">
        <h1 className="text-4xl font-bold mb-6 text-orange-ember font-header tracking-wide">
          {profile.username}'s Profile
        </h1>

        <img
          src={avatarUrl}
          alt="Avatar"
          className="mx-auto h-32 w-32 rounded-full object-cover border-2 border-orange-ember shadow mb-4"
        />

        <div className="space-y-2 text-left">
          <p><span className="font-semibold text-orange-ember">Username:</span> {profile.username}</p>
          {profile.location && (
            <p><span className="font-semibold text-orange-ember">Location:</span> {profile.location}</p>
          )}
          {profile.share_birthday && formattedBirthday && (
            <p><span className="font-semibold text-orange-ember">Birthday:</span> {formattedBirthday}</p>
          )}
        </div>

        <div className="flex justify-center mt-6 space-x-4 text-2xl">
          {profile.sun_sign && <span title="Sun Sign">☀️ {profile.sun_sign}</span>}
          {profile.moon_sign && <span title="Moon Sign">🌙 {profile.moon_sign}</span>}
          {profile.rising_sign && <span title="Rising Sign">🌅 {profile.rising_sign}</span>}
        </div>
      </div>
    </Layout>
  );
}
