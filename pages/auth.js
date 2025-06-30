// pages/auth.js
import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Check, X } from 'lucide-react';

export default function AuthPage() {
  const [view, setView] = useState('sign-in');
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    first_name: '',
    last_name: '',
  });
  const [message, setMessage] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [isEmailValid, setIsEmailValid] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const response = await fetch('/api/set-session-cookie', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
                expiresIn: session.expires_in,
                user: session.user, // This user object contains user_metadata.username
              }),
            });

            if (response.ok) {
              router.replace('/grimoire');
            } else {
              const errorData = await response.json();
              console.error('Cookie error:', errorData.message);
              setMessage(`❌ Failed to set forum session: ${errorData.message}`);
              router.replace('/error?code=sso_cookie_fail');
            }
          } catch (error) {
            console.error('Network error calling cookie API route:', error);
            setMessage('❌ Network error during SSO setup.');
            router.replace('/error?code=sso_network_error');
          }
        }
      }
    );

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (view === 'sign-up' && form.email.trim()) {
      const isValid = emailRegex.test(form.email.trim().toLowerCase());
      setIsEmailValid(isValid);
      if (isValid) {
        const timer = setTimeout(() => checkEmailExists(form.email.trim().toLowerCase()), 500);
        return () => clearTimeout(timer);
      } else {
        setEmailAvailable(null);
      }
    }
  }, [form.email, view]);

  useEffect(() => {
    if (view === 'sign-up' && form.username.trim()) {
      if (usernameRegex.test(form.username.trim())) {
        const timer = setTimeout(() => checkUsernameExists(form.username.trim()), 500);
        return () => clearTimeout(timer);
      } else {
        setUsernameAvailable(false);
      }
    } else if (view === 'sign-up') {
      setUsernameAvailable(null);
    }
  }, [form.username, view]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let normalized = value;
    if (name === 'email') normalized = value.trim().toLowerCase();
    if (name === 'username') normalized = value.trim();
    setForm(prev => ({ ...prev, [name]: normalized }));
    setMessage(null);
  };

  const checkEmailExists = async (email) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email);
    if (error) {
      console.error('Email check error:', error);
      setEmailAvailable(false);
    } else {
      setEmailAvailable(data.length === 0);
    }
  };

  const checkUsernameExists = async (username) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', username);
    if (error) {
      console.error('Username check error:', error);
      setUsernameAvailable(false);
    } else {
      setUsernameAvailable(data.length === 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const { email, password, confirmPassword, username, first_name, last_name } = form;

    if (!emailRegex.test(email)) return setMessage('❌ Invalid email format.');
    if (view === 'sign-up') {
      if (!usernameRegex.test(username)) return setMessage('❌ Username must be 3-20 characters, alphanumeric or underscores.');
      if (usernameAvailable === false) return setMessage('❌ Username is taken.');
      if (password !== confirmPassword) return setMessage('❌ Passwords do not match.');
      if (!first_name.trim()) return setMessage('❌ First name is required.');
      if (!last_name.trim()) return setMessage('❌ Last name is required.');
    }

    try {
      const response = view === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
              // ⭐ CRITICAL FIX FOR NODEBB DISPLAY NAME:
              // Only send 'username' to auth.users.raw_user_meta_data.
              // This is what NodeBB uses for the display name.
              data: { username },
            },
          });

      if (response.error) {
        setMessage(`❌ ${response.error.message}`);
      } else {
        if (view === 'sign-up') {
          const { user } = response.data;

          if (user) {
              // ⭐ CRITICAL FOR PROFILES TABLE:
              // Explicitly insert into the public.profiles table.
              // This ensures first_name and last_name are saved,
              // as the backend 'handle_new_user' function is currently insufficient.
              const { error: profileInsertError } = await supabase
                  .from('profiles')
                  .insert({
                      id: user.id, // Link to auth.users.id
                      username: username,
                      first_name: first_name, // Your form value
                      last_name: last_name,   // Your form value
                      email: email, // Include email if profiles table has it
                      // ... any other required profile fields that are not null
                  });

              if (profileInsertError) {
                  // This error is likely the RLS policy violation you saw earlier.
                  // It will be fixed by the RLS policy setup below.
                  console.error('Error inserting into profiles table from client:', profileInsertError);
                  setMessage(`❌ Account created, but profile setup failed: ${profileInsertError.message}. Please contact support.`);
              } else {
                  setMessage('✅ Check your email to confirm your account! Your profile has been set up.');
              }
          } else {
              setMessage('✅ Check your email to confirm your account! User data missing for profile setup.');
          }
        } else { // sign-in view
          setMessage('✅ Logging in...');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setMessage('❌ Unexpected error during authentication.');
    }
  };

  const handleForgotPassword = async () => {
    if (!form.email || !emailRegex.test(form.email)) {
      setMessage('❌ Enter a valid email for password reset.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset`,
    });
    setMessage(error ? `❌ ${error.message}` : '✅ Reset link sent to email.');
  };

  const isSignUpButtonDisabled =
    view === 'sign-up' && (
      !isEmailValid ||
      emailAvailable === false ||
      !usernameRegex.test(form.username) ||
      usernameAvailable === false ||
      !form.username.trim() ||
      form.password !== form.confirmPassword ||
      !form.password ||
      !form.first_name.trim() ||
      !form.last_name.trim()
    );


  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-black-veil text-white px-4">
        <div className="bg-forest/70 border border-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-sm shadow-lg">
          <div className="flex justify-center mb-5 space-x-4">
            <button onClick={() => setView('sign-in')}
              className={`px-3 py-1 rounded text-sm ${view === 'sign-in' ? 'bg-orange-ember text-white' : 'bg-black/30 text-ash-light'}`}>
              Sign In
            </button>
            <button onClick={() => setView('sign-up')}
              className={`px-3 py-1 rounded text-sm ${view === 'sign-up' ? 'bg-orange-ember text-white' : 'bg-black/30 text-ash-light'}`}>
              Sign Up
            </button>
          </div>

          {message && <p className="mb-4 text-sm text-center">{message}</p>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full px-2 py-1 text-sm rounded bg-slate-800 text-white" />

            {view === 'sign-up' && (
              <>
                <input type="text" name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} required className="w-full px-2 py-1 text-sm rounded bg-slate-800 text-white" />
                <input type="text" name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} required className="w-full px-2 py-1 text-sm rounded bg-slate-800 text-white" />
                <input type="text" name="username" placeholder="Username (3-20 chars)" value={form.username} onChange={handleChange} required className="w-full px-2 py-1 text-sm rounded bg-slate-800 text-white" />
              </>
            )}

            <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="w-full px-2 py-1 text-sm rounded bg-slate-800 text-white" />
            {view === 'sign-up' && <input type={showPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required className="w-full px-2 py-1 text-sm rounded bg-slate-800 text-white" />}

            <label className="text-xs text-white flex items-center space-x-2">
              <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
              <span>Show Password</span>
            </label>

            {view === 'sign-in' && (
              <button type="button" onClick={handleForgotPassword} className="text-xs text-orange-400 hover:underline">
                Forgot password?
              </button>
            )}

            <button type="submit" disabled={isSignUpButtonDisabled} className="w-full bg-orange-ember hover:bg-orange-600 text-white py-1.5 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed">
              {view === 'sign-in' ? 'Log In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}