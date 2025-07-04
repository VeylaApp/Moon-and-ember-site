// pages/auth/reset.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '@/lib/supabase';
import Layout from '@/components/Layout';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const type = params.get('type');

    if (accessToken && type === 'recovery') {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: accessToken, // Supabase expects both
      }).then(({ error }) => {
        if (error) {
          setError('Failed to validate recovery token.');
        } else {
          setTokenChecked(true);
        }
      });
    } else {
      setError('Invalid or missing recovery token.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError('Both fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message || 'Password update failed.');
    } else {
      setSuccess('✅ Password updated! Redirecting...');
      setTimeout(() => router.push('/grimoire'), 2000);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-black-veil text-white px-4">
        <div className="bg-forest/70 border border-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-sm shadow-lg">
          <h1 className="text-xl font-header mb-4 text-center text-orange-ember">Reset Your Password</h1>

          {!tokenChecked && !error && <p className="text-sm text-center text-gray-400">Validating link...</p>}

          {error && <p className="text-sm text-red-400 mb-4 text-center">{error}</p>}
          {tokenChecked && !error && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  className="w-full px-3 py-2 text-sm rounded bg-slate-800 text-white pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  className="w-full px-3 py-2 text-sm rounded bg-slate-800 text-white pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <label className="flex items-center text-xs text-ash-light space-x-2">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                <span>Show Password</span>
              </label>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-red-400 text-xs">Passwords do not match.</p>
              )}
              <button
                type="submit"
                className="w-full bg-orange-ember hover:bg-orange-600 text-white py-1.5 text-sm rounded"
                disabled={!password || !confirmPassword || password !== confirmPassword}
              >
                Set New Password
              </button>
              {success && <p className="text-sm text-green-400 text-center">{success}</p>}
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
