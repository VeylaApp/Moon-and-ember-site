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
  });
  const [message, setMessage] = useState(null); // General form submission messages

  // Validation states for real-time feedback
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [isEmailValid, setIsEmailValid] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [isPasswordTooShort, setIsPasswordTooShort] = useState(null); // New
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(null);     // New

  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/; // Adjusted regex for username length

  // Effect for handling authentication state changes and cookie setup
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

  // Effect for email validation (real-time)
  useEffect(() => {
    if (view === 'sign-up' && form.email.trim()) {
      const isValid = emailRegex.test(form.email.trim().toLowerCase());
      setIsEmailValid(isValid);
      if (isValid) {
        const timer = setTimeout(() => checkEmailExists(form.email.trim().toLowerCase()), 500);
        return () => clearTimeout(timer);
      } else {
        setEmailAvailable(null); // Clear availability if format invalid
      }
    } else if (view === 'sign-up') {
      setIsEmailValid(null);
      setEmailAvailable(null);
    }
  }, [form.email, view]);

  // Effect for username validation (real-time)
  useEffect(() => {
    if (view === 'sign-up' && form.username.trim()) {
      if (usernameRegex.test(form.username.trim())) {
        const timer = setTimeout(() => checkUsernameExists(form.username.trim()), 500);
        return () => clearTimeout(timer);
      } else {
        setUsernameAvailable(false); // Username format invalid
      }
    } else if (view === 'sign-up') {
      setUsernameAvailable(null);
    }
  }, [form.username, view]);

  // Effect for password validation (real-time)
  useEffect(() => {
    if (view === 'sign-up') {
      // Check password length
      if (form.password.length > 0) { // Only check if password is not empty
        setIsPasswordTooShort(form.password.length < 6);
      } else {
        setIsPasswordTooShort(null); // No error if empty
      }

      // Check password match, only if confirmPassword is also typed
      if (form.password.length > 0 && form.confirmPassword.length > 0) {
        setDoPasswordsMatch(form.password === form.confirmPassword);
      } else {
        setDoPasswordsMatch(null); // No error if one or both are empty
      }
    } else { // Reset on view change
      setIsPasswordTooShort(null);
      setDoPasswordsMatch(null);
    }
  }, [form.password, form.confirmPassword, view]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    let normalized = value;
    if (name === 'email') normalized = value.trim().toLowerCase();
    if (name === 'username') normalized = value.trim();
    setForm(prev => ({ ...prev, [name]: normalized }));
    // Clear general message on any input change
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
    setMessage(null); // Clear messages on submission attempt
    const { email, password, confirmPassword, username } = form;

    // Client-side validation for sign-up view - these are now primarily for preventing submission
    // and as a final check, as real-time feedback is handled by useEffects.
    if (view === 'sign-up') {
      if (!isEmailValid || emailAvailable === false) {
        setMessage('❌ Please correct email issues.');
        return;
      }
      if (!usernameRegex.test(username) || usernameAvailable === false) {
        setMessage('❌ Please correct username issues.');
        return;
      }
      if (password.length < 6) {
        setMessage('❌ Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setMessage('❌ Passwords do not match.');
        return;
      }
    }

    try {
      const response = view === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
              data: { username },
            },
          });

      if (response.error) {
        setMessage(`❌ ${response.error.message}`);
      } else {
        if (view === 'sign-up') {
          setMessage('✅ Check your email to confirm your account!');
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

  // Simplified disable logic for sign-up button, reflecting removed fields
  const isSignUpButtonDisabled =
    view === 'sign-up' && (
      !isEmailValid || // Email format is invalid
      emailAvailable === false || // Email is taken
      !usernameRegex.test(form.username) || // Username format is invalid
      usernameAvailable === false || // Username is taken
      !form.username.trim() || // Username field is empty
      isPasswordTooShort || // Password too short
      doPasswordsMatch === false || // Passwords don't match
      !form.password || // Password field is empty
      !form.confirmPassword // Confirm password field is empty
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
            <div className="relative"> {/* Wrapper for email input and icon */}
              <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full px-2 py-1 text-sm rounded bg-slate-800 text-white pr-8" />
              {(form.email.trim() && view === 'sign-up') && ( // Only show indicator in sign-up view and if email is typed
                isEmailValid === true && emailAvailable === true ? <Check className="text-green-500 absolute right-2 top-1/2 -translate-y-1/2" size={16} /> :
                (isEmailValid === false || emailAvailable === false) ? <X className="text-red-500 absolute right-2 top-1/2 -translate-y-1/2" size={16} /> : null
              )}
            </div>

            {view === 'sign-up' && (
              <>
                <div className="relative">
                  <input type="text" name="username" placeholder="Username (3-20 chars, alphanumeric/_)" value={form.username} onChange={handleChange} required className="w-full px-2 py-1 text-sm rounded bg-slate-800 text-white pr-8" />
                  {(form.username.trim() && usernameRegex.test(form.username.trim())) && (
                    usernameAvailable === true ? <Check className="text-green-500 absolute right-2 top-1/2 -translate-y-1/2" size={16} /> :
                    usernameAvailable === false ? <X className="text-red-500 absolute right-2 top-1/2 -translate-y-1/2" size={16} /> : null
                  )}
                  {form.username.trim() && !usernameRegex.test(form.username.trim()) && (
                    <p className="text-red-400 text-xs mt-1">Username must be 3-20 characters, alphanumeric or underscores.</p>
                  )}
                  {usernameAvailable === false && usernameRegex.test(form.username.trim()) && (
                    <p className="text-red-400 text-xs mt-1">Username is taken.</p>
                  )}
                </div>

                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="w-full px-2 py-1 text-sm rounded bg-slate-800 text-white" />
                  {isPasswordTooShort && form.password.length > 0 && (
                    <p className="text-red-400 text-xs mt-1">Password must be at least 6 characters.</p>
                  )}
                </div>

                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required className="w-full px-2 py-1 text-sm rounded bg-slate-800 text-white" />
                  {doPasswordsMatch === false && form.confirmPassword.length > 0 && (
                    <p className="text-red-400 text-xs mt-1">Passwords do not match.</p>
                  )}
                </div>
              </>
            )}

            {view === 'sign-in' && (
              <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="w-full px-2 py-1 text-sm rounded bg-slate-800 text-white" />
            )}

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