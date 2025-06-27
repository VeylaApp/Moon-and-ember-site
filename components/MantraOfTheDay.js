'use client';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase'; // ✅ use shared instance

export default function MantraOfTheDay() {
  const [mantra, setMantra] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomMantra = async () => {
      const { data, error } = await supabase
        .from('mantra')
        .select('*');

      if (error) {
        console.error('Failed to fetch mantras:', error);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        setMantra(data[randomIndex]);
      }

      setLoading(false);
    };

    fetchRandomMantra();
  }, []);

  if (loading) return <p className="text-ash-light">Loading mantra...</p>;
  if (!mantra) return <p className="text-rose-muted">No mantras available in the database.</p>;

  return (
    <div className="bg-forest/40 rounded-xl shadow-lg p-6 text-center text-white border border-white/20 backdrop-blur">
      <h2 className="text-xl font-header text-orange-ember mb-2">✨ Mantra of the Day ✨</h2>
      <p className="italic text-lg mb-2">“{mantra.text}”</p>
      
    </div>
  );
}
