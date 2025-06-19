import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else window.location.href = '/dashboard';
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage('Check your email to confirm your account!');
  };

  return (
    <main>
      <h1>Login / Sign Up</h1>
      <form>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div>
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleSignup}>Sign Up</button>
        </div>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
