import { useEffect, useState } from 'react';
import  supabase  from '@/lib/supabase';
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function UserDirectory() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, first_name')
        .order('username', { ascending: true });

      if (error) {
        console.error('Error fetching users:', error.message);
      } else {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-8 mt-20 bg-black-veil/80 border border-white/10 backdrop-blur-md rounded-2xl shadow-xl text-white">
        <h1 className="text-4xl font-bold mb-6 text-orange-ember font-header text-center tracking-wide">
          Member Directory
        </h1>

        {loading ? (
          <p className="text-center">Loading users...</p>
        ) : (
          <ul className="space-y-4">
            {users.map((user) => (
              <li key={user.username} className="bg-midnight/70 rounded-lg p-4 shadow-md hover:shadow-lg transition-all">
                <Link href={`/u/${user.username}`} className="text-orange-ember text-xl font-semibold hover:underline">
                  {user.username}
                </Link>
                {user.first_name && (
                  <p className="text-ash-light text-sm">First Name: {user.first_name}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
