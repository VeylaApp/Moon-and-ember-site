import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

export default function HighlightsByDate() {
  const [astro, setAstro] = useState(null);
  const [energies, setEnergies] = useState([]);
  const [dataDate, setDataDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData(date) {
      setLoading(true);
      const headers = {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      };

      try {
        const astroUrl = `https://bohmreonbrxneehnqvku.supabase.co/rest/v1/daily_astro_api?date=eq.${date}`;
        const astroRes = await fetch(astroUrl, { headers });
        const astroJson = await astroRes.json();
        let astroData = astroJson[0] || null;

        if (astroData?.output && typeof astroData.output === 'string') {
          try {
            astroData.output = JSON.parse(astroData.output);
          } catch (err) {
            console.error('Failed to parse astrology output JSON:', err);
            astroData.output = null;
          }
        }

        const energiesUrl = `https://bohmreonbrxneehnqvku.supabase.co/rest/v1/daily_energies?date=eq.${date}`;
        const energiesRes = await fetch(energiesUrl, { headers });
        const energiesJson = await energiesRes.json();

        setAstro(astroData);
        setEnergies(energiesJson || []);
        setDataDate(astroData?.date || energiesJson[0]?.date || null);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (selectedDate) {
      fetchData(selectedDate);
    }
  }, [selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  if (loading) return <p className="text-ash-light p-4">Speaking with the cosmos...</p>;
  if (!astro || !astro.output) return <p className="text-red-400">No astrology data available for this date.</p>;

  const planets = astro.output;
  const sun = planets.find(p => p.name === 'Sun');
  const moon = planets.find(p => p.name === 'Moon');
  const retrogrades = planets.filter(p => typeof p.isRetro === 'string' && p.isRetro.toLowerCase() === 'true');

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 bg-forest/30 text-white rounded-xl shadow-lg backdrop-blur border border-white/20">
        <h1 className="text-3xl font-header text-orange-ember mb-4">Energetic Highlights</h1>

        <label className="block text-ash-light text-sm mb-4">
          Select a date:
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="ml-2 p-1 rounded bg-white text-black"
          />
        </label>

        {dataDate && (
          <p className="text-sm text-ash-light mb-4">
            Data for{' '}
            <span className="text-white font-semibold">
              {new Date(`${dataDate}T12:00:00`).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </p>
        )}

        <section className="mb-6">
          <h2 className="text-xl text-rose-muted mb-2">🪐 Celestial Bodies ✨</h2>
          <p>☀️ Sun in <strong>{getZodiacWithEmoji(sun?.zodiac)}</strong></p>
          <p>🌙 Moon in <strong>{getZodiacWithEmoji(moon?.zodiac)}</strong></p>

          {retrogrades.length > 0 ? (
            <p className="text-sm text-ash-light mt-2">🌀 Retrogrades: {retrogrades.map(p => p.name).join(', ')}</p>
          ) : (
            <p className="text-sm text-green-200 mt-2">✨ All planets move direct on this day.</p>
          )}

          <details className="mt-4">
            <summary className="cursor-pointer text-sm underline text-orange-300">🔍 View all planetary positions</summary>
            <ul className="text-sm mt-2">
              {planets.map(p => (
                <li key={p.name} className="mb-1">
                  <strong>{p.name}</strong>: {getZodiacWithEmoji(p.zodiac)} ({parseFloat(p.normDegree).toFixed(2)}°){' '}
                  {p.isRetro?.toString().toLowerCase() === 'true' ? '🔁' : ''}
                </li>
              ))}
            </ul>
          </details>
        </section>

        {energies.length > 0 && (
          <section>
            <h2 className="text-xl text-yellow-200 mb-2"> </h2>
            {energies.map((e, i) => (
              <div key={i} className="mb-4 pl-4">
                {e.moon_phase && <p>🌖 Moon Phase: <strong>{e.moon_phase}</strong></p>}
                {e.sabbat && <p>🌿 Sabbat: <strong>{e.sabbat}</strong></p>}
                {e.eclipse_day && <p>🌘 Eclipse: <strong>{e.eclipse_day}</strong></p>}
                {e.seasonal_day && <p>🍂 Seasonal: <strong>{e.seasonal_day}</strong></p>}
                {e.energy && <p className="mt-2 italic">"{e.energy}"</p>}
              </div>
            ))}
          </section>
        )}
      </div>
    </Layout>
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
