import { useState } from 'react';
import { useRouter } from 'next/router';
import  supabase  from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      router.push('/grimoire'); // ✅ redirect to grimoire after login
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email to confirm your account!');
    }
  };

  return (
    <main className="p-8 text-white">
      <h1 className="text-3xl font-header mb-6">Login / Sign Up</h1>
      <form className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded bg-slate-800 text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded bg-slate-800 text-white"
        />
        <div className="flex space-x-4">
          <button
            onClick={handleLogin}
            className="bg-orange-ember text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Login
          </button>
          <button
            onClick={handleSignup}
            className="bg-green-forest text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Sign Up
          </button>
        </div>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </main>
  );
}
