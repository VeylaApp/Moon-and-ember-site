// pages/api/saveFutureAstro.js
// This API saves future Western astrology data to Supabase.
import supabase from '@/lib/supabase'; // ✅ use shared instance

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const { year, month, date } = req.body;

  if (!year || !month || !date) {
    return res.status(400).json({ message: 'Missing year, month, or date in request body' });
  }

  const targetDate = new Date(`${year}-${month}-${date}`);
  const payload = {
    year,
    month,
    date,
    hours: 12,
    minutes: 0,
    seconds: 0,
    latitude: 38.4192,
    longitude: -81.6333,
    timezone: 0,
    config: {
      observation_point: "topocentric",
      ayanamsha: "tropical",
      language: "en"
    }
  };

  try {
    const response = await fetch('https://json.freeastrologyapi.com/western/planets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ASTRO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ message: 'API failed', details: data });
    }

    const astroData = {
      date: targetDate.toISOString().split('T')[0],
      output: (data.output || []).map((item) => ({
        name: item.planet?.en || 'Unknown',
        fullDegree: item.fullDegree,
        normDegree: item.normDegree,
        isRetro: item.isRetro,
        zodiac: item.zodiac_sign?.en || item.zodiac_sign?.name?.en || 'Unknown',
      })),
      moon_phase: data.moonPhase || null,
    };

    const { error } = await supabase.from('daily_astro_api').upsert([astroData], {
      onConflict: ['date'],
    });

    if (error) {
      return res.status(500).json({ message: 'Supabase insert failed', error });
    }

    res.status(200).json({ message: 'Astro data saved successfully', data: astroData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unexpected error', error: err.message });
  }
}
