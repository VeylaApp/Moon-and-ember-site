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
                user: session.user,
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
      if (!usernameAvailable) return setMessage('❌ Username is taken.');
      if (password !== confirmPassword) return setMessage('❌ Passwords do not match.');
    }

    try {
      const response = view === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
              data: { username, first_name, last_name },
            },
          });

      if (response.error) {
        setMessage(`❌ ${response.error.message}`);
      } else {
        setMessage(view === 'sign-up'
          ? '✅ Check your email to confirm your account.'
          : '✅ Logging in...');
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
      !emailAvailable ||
      !usernameRegex.test(form.username) ||
      !form.username ||
      !usernameAvailable ||
      form.password !== form.confirmPassword ||
      !form.password ||
      !form.first_name ||
      !form.last_name
    );

  return (
    <Layout>
      {/* FORM LAYOUT OMITTED FOR BREVITY, SAME AS PREVIOUS WITH ADDED first_name, last_name INPUTS */}
    </Layout>
  );
}
