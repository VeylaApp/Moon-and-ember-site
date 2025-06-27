// utils/getAstrologyData.js
export async function getDailyAstrology() {
  const API_KEY = 'RN95eGAEGr4c9jjFlVRGf3RTzp1mX1tVaMdTzxiO';

  const now = new Date();
  const body = {
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    date: now.getUTCDate(),
    hours: now.getUTCHours(),
    minutes: now.getUTCMinutes(),
    seconds: 0,
    latitude: 38.9072,  // Charleston or DC
    longitude: -77.0369,
    timezone: 0,        // Always use UTC for this API
    settings: {
      observation_point: 'topocentric',
      ayanamsha: 'lahiri'
    }
  };

  try {
    const res = await fetch('https://json.freeastrologyapi.com/planets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('🛑 Astrology API failed:', errorData);
      return null;
    }

    const data = await res.json();
    const output = data.output?.[1];

    if (!output) {
      console.error('⚠️ Unexpected astrology API response structure:', data);
      return null;
    }

    const retrogrades = Object.entries(output)
      .filter(([_, val]) => val.isRetro === 'true')
      .map(([key]) => key);

    return {
      sunSign: getZodiacSign(output.Sun?.current_sign),
      moonSign: getZodiacSign(output.Moon?.current_sign),
      retrogrades,
      moonPhase: data.moonPhase ?? null, // ✅ Add moon phase if present
    };
  } catch (err) {
    console.error('💥 Astrology fetch error:', err.message || err);
    return null;
  }
}

function getZodiacSign(index) {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  return signs[(index ?? 1) - 1] || 'Unknown';
}

