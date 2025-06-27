// pages/viewAstro.js
import { useState } from 'react';

export default function ViewAstro() {
  const [inputDate, setInputDate] = useState('');
  const [astroData, setAstroData] = useState(null);
  const [error, setError] = useState(null);

  const handleFetch = async () => {
    setError(null);
    setAstroData(null);

    if (!inputDate) {
      setError('Please select a date first.');
      return;
    }

    console.log('🔍 Fetching data for:', inputDate);

    try {
      const res = await fetch(`/api/getAstroByDate?date=${inputDate}`);
      const data = await res.json();

      console.log('🛰️ Raw response:', data);

      if (!res.ok) {
        return setError(data.message || 'Error fetching data');
      }

      let parsedOutput = data.data.output;

      if (typeof parsedOutput === 'string') {
        try {
          parsedOutput = JSON.parse(parsedOutput);
        } catch (e) {
          return setError('Failed to parse planetary data.');
        }
      }

      setAstroData({
        ...data.data,
        output: parsedOutput,
      });
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      setError('Unexpected error fetching data.');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">🔭 View Daily Astrology</h1>

      <div className="flex gap-2 items-center mb-4">
        <input
          type="date"
          value={inputDate}
          onChange={(e) => setInputDate(e.target.value)}
          className="border border-white/30 bg-ash-dark text-ash-light p-2 rounded"
        />
        <button
          onClick={handleFetch}
          className="px-4 py-2 bg-green-700 text-white rounded hover:shadow-[0_0_10px_2px_#204e39]"
        >
          Fetch Astro
        </button>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {astroData && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">
            Data for:{' '}
            {new Date(astroData.date).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h2>
          <p>🌖 Moon Phase: {astroData.moon_phase || 'Unknown'}</p>
          <ul className="mt-4 space-y-1">
            {astroData.output.map((planet, i) => (
              <li key={i}>
                <strong>{planet.name}</strong> in <strong>{planet.zodiac}</strong>{' '}
                ({parseFloat(planet.normDegree).toFixed(2)}°){' '}
                {planet.isRetro?.toString().toLowerCase() === 'true' ? '🔁' : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
