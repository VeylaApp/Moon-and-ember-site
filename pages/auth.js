// pages/auth.js
import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Check, X } from 'lucide-react';

export default function AuthPage() {
  const [view, setView] = useState('sign-in');
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (view === 'sign-up' && form.email.trim()) {
      const timer = setTimeout(() => checkEmailExists(form.email.trim().toLowerCase()), 500);
      return () => clearTimeout(timer);
    }
  }, [form.email, view]);

  // *** NEW useEffect for handling session changes and setting cookie ***
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // This listener fires on initial load, after sign-in/sign-up, token refresh, etc.
        // We only care about SIGNED_IN events that have a valid session.
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in via Supabase. Attempting to set forum cookie...');
          try {
            const response = await fetch('/api/set-session-cookie', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
                expiresIn: session.expires_in,
                user: session.user, // Optional, but good to pass along
              }),
            });

            if (response.ok) {
              console.log('Forum session cookie set successfully by API route.');
              // Redirect to dashboard or forum *after* cookie is set
              // Use router.replace to prevent going back to auth page after login
              router.replace('/grimoire'); 
            } else {
              const errorData = await response.json();
              console.error('Failed to set forum session cookie:', errorData.message);
              setMessage(`❌ Failed to set forum session: ${errorData.message}`);
              // Consider a different redirect if cookie setting fails, or display error
              router.replace('/error?code=sso_cookie_fail'); 
            }
          } catch (error) {
            console.error('Network error calling cookie API route:', error);
            setMessage('❌ An unexpected network error occurred during SSO setup.');
            router.replace('/error?code=sso_network_error'); 
          }
        } else if (event === 'SIGNED_OUT') {
            // Optional: If you want to clear the forum cookie on logout from main app
            // You would need another API route to clear the cookie
            // fetch('/api/clear-session-cookie', { method: 'POST' });
        }
      }
    );

    return () => {
      authListener.unsubscribe();
    };
  }, [router]); // router is a dependency, include it in the array

  const handleChange = (e) => {
    const { name, value } = e.target;
    const normalizedValue = name === 'email' ? value.trim().toLowerCase() : value;
    setForm((prev) => ({ ...prev, [name]: normalizedValue }));
  };

  const checkEmailExists = async (email) => {
    setEmailAvailable(null);
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email);

    if (error) {
      console.error('Email check error:', error);
      setEmailAvailable(false);
      return;
    }

    setEmailAvailable(data.length === 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const { email, password, confirmPassword } = form;

    if (view === 'sign-up' && password !== confirmPassword) {
      setMessage('❌ Passwords do not match.');
      return;
    }

    let response;
    try {
      if (view === 'sign-in') {
        response = await supabase.auth.signInWithPassword({ email, password });
      } else {
        response = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
          },
        });
      }

      if (response.error) {
        setMessage(`❌ ${response.error.message}`);
      } else {
        // For sign-up, still show email confirmation message.
        // For sign-in, the useEffect will handle the redirection after cookie is set.
        if (view === 'sign-up') {
          setMessage('✅ Check your email to confirm.');
        } else {
          // Message for successful sign-in will be handled by useEffect after cookie logic
          setMessage('✅ Logging in...'); // Temporary message while cookie is set
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setMessage('❌ An unexpected error occurred.');
    }
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      setMessage('❌ Please enter your email address first.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset`,
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage('✅ Password reset link sent. Check your email.');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-black-veil text-white px-4">
        <div className="bg-forest/70 border border-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-sm shadow-lg">
          <div className="flex justify-center mb-5 space-x-4">
            <button
              onClick={() => setView('sign-in')}
              className={`px-3 py-1 rounded text-sm ${
                view === 'sign-in' ? 'bg-orange-ember text-white' : 'bg-black/30 text-ash-light'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setView('sign-up')}
              className={`px-3 py-1 rounded text-sm ${
                view === 'sign-up' ? 'bg-orange-ember text-white' : 'bg-black/30 text-ash-light'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-2 py-1 text-sm rounded bg-slate-800 text-white"
              />
              {view === 'sign-up' && form.email && (
                <div className="absolute right-2 top-2">
                  {emailAvailable === null ? (
                    <span className="text-amber-400 text-xs">...</span>
                  ) : emailAvailable ? (
                    <Check className="text-green-500 w-4 h-4" />
                  ) : (
                    <X className="text-red-500 w-4 h-4" />
                  )}
                </div>
              )}
            </div>

            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-2 py-1 text-sm rounded bg-slate-800 text-white"
            />

            {view === 'sign-up' && (
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-2 py-1 text-sm rounded bg-slate-800 text-white"
              />
            )}

            {view === 'sign-up' &&
              form.password &&
              form.confirmPassword &&
              form.password !== form.confirmPassword && (
                <p className="text-red-400 text-sm">Passwords do not match</p>
              )}

            <label className="text-xs text-white flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <span>Show Password</span>
            </label>

            {view === 'sign-in' && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-orange-400 hover:underline"
              >
                Forgot password?
              </button>
            )}

            <button
              type="submit"
              className="w-full bg-orange-ember hover:bg-orange-600 text-white py-1.5 text-sm rounded"
              disabled={view === 'sign-up' && (!emailAvailable || form.password !== form.confirmPassword)}
            >
              {view === 'sign-in' ? 'Log In' : 'Create Account'}
            </button>
          </form>

          {message && <p className="mt-4 text-sm text-center">{message}</p>}
        </div>
      </div>
    </Layout>
  );
}