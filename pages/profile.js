// pages/profile.js
import { useState, useEffect } from 'react';
import  supabase  from '@/lib/supabase';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function ProfilePage() {
  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    avatar_url: '',
    location: '',
    birthday: '',
    share_birthday: false,
    sun_sign: '',
    moon_sign: '',
    rising_sign: '',
    book_title: '',
    email: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndFetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth');
        return;
      }

      const user = session.user;
      setUserId(user.id);
      setUserEmail(user.email);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setForm({
          ...form,
          ...data,
          email: user.email,
          share_birthday: data.share_birthday || false,
        });
      } else {
        setForm((prev) => ({ ...prev, email: user.email }));
      }

      setLoading(false);
    };

    checkSessionAndFetchProfile();
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setAvatarFile(file);
    } else {
      setMessage('❌ File must be under 5MB');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      setMessage('❌ No user session found');
      setLoading(false);
      return;
    }

    const user = session.user;
    let avatar_url = form.avatar_url;

    if (avatarFile) {
      const path = `${user.id}/${avatarFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true });

      if (uploadError) {
        setMessage(`❌ Avatar upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: urlData, error: urlError } = supabase.storage.from('avatars').getPublicUrl(path);
      if (urlError || !urlData?.publicUrl) {
        setMessage('❌ Failed to get public avatar URL');
        setLoading(false);
        return;
      }
      avatar_url = urlData.publicUrl;
    }

    const upsertData = {
      id: user.id,
      ...form,
      avatar_url,
    };

    const { error } = await supabase.from('profiles').upsert(upsertData);

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage('✅ Profile updated!');
    }
    setLoading(false);
  };

  const zodiacOptions = [
    '♈ Aries', '♉ Taurus', '♊ Gemini', '♋ Cancer',
    '♌ Leo', '♍ Virgo', '♎ Libra', '♏ Scorpio',
    '♐ Sagittarius', '♑ Capricorn', '♒ Aquarius', '♓ Pisces'
  ];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-8 bg-black-veil/80 border border-white/10 backdrop-blur-md rounded-2xl mt-2 shadow-2xl">
        <div className="mb-6 p-4 rounded-md bg-orange-100 border-l-4 border-orange-400 text-orange-900 text-sm shadow-md">
          <p>
            <strong>Note:</strong> Your <em>first</em> and <em>last name</em> are for internal use only. They will never be shown publicly anywhere on the site. If you need to update your email address, please message the site admin.
          </p>
        </div>

        {userEmail === 'kellipinar@outlook.com' && (
          <div className="text-center mb-4">
            <button
              onClick={() => router.push('/admin/AdminTools')}
              className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:shadow-[0_0_10px_2px_#204e39] transition-shadow font-semibold"
            >
              🛠️ Admin Tools
            </button>
          </div>
        )}

        <h1 className="text-4xl font-bold mb-6 text-orange-ember text-center font-header tracking-wide">
          Update Your Profile
        </h1>

        {message && (
          <p className="mb-4 text-white bg-midnight/80 p-3 rounded text-center font-medium shadow-md">
            {message}
          </p>
        )}

        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="hidden" name="id" value={userId || ''} />

            <label className="block text-sm text-ash-light">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              readOnly
              className="w-full p-3 rounded-lg bg-slate-700 text-white opacity-70 cursor-not-allowed"
            />

            <label className="block text-sm text-ash-light">Username</label>
            <input name="username" value={form.username} onChange={handleChange} required className="w-full p-3 rounded-lg bg-slate-800 text-white" />

            <label className="block text-sm text-ash-light">Custom Grimoire Name</label>
            <input name="book_title" value={form.book_title} onChange={handleChange} className="w-full p-3 rounded-lg bg-slate-800 text-white" />

            <label className="block text-sm text-ash-light">First Name</label>
            <input name="first_name" value={form.first_name} onChange={handleChange} required className="w-full p-3 rounded-lg bg-slate-800 text-white" />

            <label className="block text-sm text-ash-light">Last Name</label>
            <input name="last_name" value={form.last_name} onChange={handleChange} required className="w-full p-3 rounded-lg bg-slate-800 text-white" />

            <label className="block text-sm text-ash-light">Location</label>
            <input name="location" value={form.location} onChange={handleChange} className="w-full p-3 rounded-lg bg-slate-800 text-white" />

            <label className="block text-sm text-ash-light">Birthday</label>
            <input type="date" name="birthday" value={form.birthday || ''} onChange={handleChange} className="w-full p-3 rounded-lg bg-slate-800 text-white" />

            <label className="flex items-center space-x-2 text-sm text-white">
              <input type="checkbox" name="share_birthday" checked={form.share_birthday} onChange={handleChange} />
              <span>Share my birthday publicly</span>
            </label>

            <label className="block text-sm text-ash-light">Sun Sign</label>
            <select name="sun_sign" value={form.sun_sign} onChange={handleChange} className="w-full p-3 rounded-lg bg-slate-800 text-white">
              <option value="">Select Sun Sign</option>
              {zodiacOptions.map((sign) => (
                <option key={sign} value={sign}>{sign}</option>
              ))}
            </select>

            <label className="block text-sm text-ash-light">Moon Sign</label>
            <select name="moon_sign" value={form.moon_sign} onChange={handleChange} className="w-full p-3 rounded-lg bg-slate-800 text-white">
              <option value="">Select Moon Sign</option>
              {zodiacOptions.map((sign) => (
                <option key={sign} value={sign}>{sign}</option>
              ))}
            </select>

            <label className="block text-sm text-ash-light">Rising Sign</label>
            <select name="rising_sign" value={form.rising_sign} onChange={handleChange} className="w-full p-3 rounded-lg bg-slate-800 text-white">
              <option value="">Select Rising Sign</option>
              {zodiacOptions.map((sign) => (
                <option key={sign} value={sign}>{sign}</option>
              ))}
            </select>

            <div>
              <label className="block mb-2 text-sm text-ash-light font-semibold">
                Upload Avatar (max 5MB):
              </label>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="w-full text-sm text-white" />
              {form.avatar_url && (
                <img src={form.avatar_url} alt="avatar" className="mt-3 h-28 w-28 rounded-full object-cover border-2 border-orange-ember shadow" />
              )}
            </div>

            <div className="text-center mt-6">
              <button type="submit" className="bg-orange-ember text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all duration-200">
                Save Profile
              </button>
            </div>
          </form>
        )}

        {userId && (
          <div className="text-center mt-6">
            <button
              onClick={() => router.push(`/profile/view?id=${userId}`)}
              className="bg-orange-ember text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-all duration-200"
            >
              View Public Profile
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
