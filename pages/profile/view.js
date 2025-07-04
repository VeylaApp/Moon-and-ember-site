import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabase';
import Layout from '@/components/Layout';

export default function ViewProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  const renderSocialLink = (platform, handle, baseUrl) => {
    if (!handle) return null;

    const cleanHandle = handle.replace(/^@/, '');
    return (
      <p className="text-white">
        <span className="font-semibold capitalize">{platform}:</span>{' '}
        <a
          href={`${baseUrl}${cleanHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-400 hover:underline"
        >
          @{cleanHandle}
        </a>
      </p>
    );
  };

  const formatBirthday = (dateString) => {
    try {
      const [year, month, day] = dateString.split('-');
      const date = new Date(`${month}/${day}/2000`); // Ignore year to avoid timezone offset
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  };

  if (loading) return <Layout><p className="text-center text-white">Loading...</p></Layout>;
  if (!profile) return <Layout><p className="text-center text-white">User not found.</p></Layout>;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-8 bg-black-veil/80 border border-white/10 backdrop-blur-md rounded-2xl mt-4 shadow-2xl text-white">
        <div className="text-center">
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt="avatar"
              className="mx-auto h-32 w-32 rounded-full object-cover border-2 border-orange-ember shadow mb-4"
            />
          )}
          <h1 className="text-4xl font-bold text-orange-ember font-header tracking-wide">
            @{profile.username}
          </h1>
          {profile.spiritual_practice && (
            <p className="mt-2 text-lg text-orange-300 font-semibold">
              {profile.spiritual_practice}
            </p>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {profile.location && (
            <p>
              <span className="font-semibold text-ash-light">Location:</span>{' '}
              {profile.location}
            </p>
          )}
          {profile.share_birthday && profile.birthday && (
            <p>
              <span className="font-semibold text-ash-light">Birthday:</span>{' '}
              {formatBirthday(profile.birthday)}
            </p>
          )}
          {profile.sun_sign && (
            <p>
              <span className="font-semibold text-ash-light">Sun Sign:</span>{' '}
              {profile.sun_sign}
            </p>
          )}
          {profile.moon_sign && (
            <p>
              <span className="font-semibold text-ash-light">Moon Sign:</span>{' '}
              {profile.moon_sign}
            </p>
          )}
          {profile.rising_sign && (
            <p>
              <span className="font-semibold text-ash-light">Rising Sign:</span>{' '}
              {profile.rising_sign}
            </p>
          )}
        </div>

        {(profile.facebook || profile.instagram || profile.tiktok || profile.other || profile.website) && (
          <>
            <hr className="my-6 border-white/20" />
            <h2 className="text-2xl font-bold text-orange-ember mb-3">Connect</h2>
            <div className="space-y-2">
              {renderSocialLink('facebook', profile.facebook, 'https://facebook.com/')}
              {renderSocialLink('instagram', profile.instagram, 'https://instagram.com/')}
              {renderSocialLink('tiktok', profile.tiktok, 'https://tiktok.com/@')}
              {profile.other && (
                <p>
                  <span className="font-semibold">Other:</span>{' '}
                  <a
                    href={/^https?:\/\//.test(profile.other) ? profile.other : `https://${profile.other}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:underline"
                  >
                    {profile.other}
                  </a>
                </p>
              )}
              {profile.website && (
                <p>
                  <span className="font-semibold">Website:</span>{' '}
                  <a
                    href={/^https?:\/\//.test(profile.website) ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:underline"
                  >
                    {profile.website}
                  </a>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
