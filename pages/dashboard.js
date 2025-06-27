import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase'; // Correct import


export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <main>
      <h1>Welcome back, {user.email}</h1>
      <p>This is your personal Book of Shadows dashboard.</p>
      <a href="/logout">Logout</a>
    </main>
  );
}