// This widget pulls current day information from the daily_astro_api and daily_energies tables in Supabase.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import supabase from '@/lib/supabase'; // singleton Supabase client

export default function EnergyOfDayWidget() {
  const [astro, setAstro] = useState(null);
  const [energies, setEnergies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local date
      console.log("📅 Local date:", today);

      try {
        // Fetch today's astro row
        const { data: astroRows, error: astroError } = await supabase
          .from('daily_astro_api')
          .select('*')
          .eq('date', today);

        if (astroError) {
          console.error('🚨 Supabase astro fetch error:', astroError);
          setLoading(false);
          return;
        }

        const astroData = astroRows?.find((row) => row.date === today) || null;

        if (astroData?.output && typeof astroData.output === 'string') {
          try {
            astroData.output = JSON.parse(astroData.output);
          } catch (err) {
            console.error('❌ Failed to parse output JSON:', err);
            setLoading(false);
            return;
          }
        }

        // Fetch today's energies
        const { data: energiesData, error: energiesError } = await supabase
          .from('daily_energies')
          .select('*')
          .eq('date', today);

        if (energiesError) {
          console.error('🚨 Supabase energies fetch error:', energiesError);
        }

        setAstro(astroData);
        setEnergies(energiesData || []);
      } catch (error) {
        console.error('🔥 Unexpected error fetching widget data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p className="text-ash-light text-center">Loading cosmic vibes...</p>;
  if (!astro?.output) return <p className="text-red-400 text-center">✨ No astrological data available.</p>;

  const planets = astro.output;
  const sun = planets.find((p) => p.name === 'Sun');
  const moon = planets.find((p) => p.name === 'Moon');

  return (
    <div className="bg-forest/40 rounded-xl shadow-lg p-6 text-center text-white border border-white/20 backdrop-blur">
      <h3 className="text-xl font-header text-orange-ember mb-2">🌟 Energies of the Day 🌟</h3>

      <p>☀️ Sun: <strong>{getZodiacWithEmoji(sun?.zodiac)}</strong></p>
      <p>🌙 Moon: <strong>{getZodiacWithEmoji(moon?.zodiac)}</strong></p>

      {energies.map((entry, idx) => (
        <div key={idx} className="mt-2">
          {entry.seasonal_day && <p>🍂 Seasonal: <strong>{entry.seasonal_day}</strong></p>}
          {entry.sabbat && <p>🌿 Sabbat: <strong>{entry.sabbat}</strong></p>}
          {entry.eclipse_day && <p>🌘 Eclipse: <strong>{entry.eclipse_day}</strong></p>}
          {entry.moon_phase && (
            <p>{entry.moon_emoji || '🌖'} Moon Phase: <strong>{entry.moon_phase}</strong></p>
          )}
          {entry.energy && <p className="italic mt-1">{entry.energy}</p>}
        </div>
      ))}

      <div className="mt-4 text-right">
        <Link href="/energytoday" className="text-sm text-orange-300 hover:underline">
          🔍 View full details
        </Link>
      </div>
    </div>
  );
}

function getZodiacWithEmoji(sign) {
  const emojiMap = {
    Aries: '♈ Aries',
    Taurus: '♉ Taurus',
    Gemini: '♊ Gemini',
    Cancer: '♋ Cancer',
    Leo: '♌ Leo',
    Virgo: '♍ Virgo',
    Libra: '♎ Libra',
    Scorpio: '♏ Scorpio',
    Sagittarius: '♐ Sagittarius',
    Capricorn: '♑ Capricorn',
    Aquarius: '♒ Aquarius',
    Pisces: '♓ Pisces',
  };
  return emojiMap[sign] || 'Unknown';
}
