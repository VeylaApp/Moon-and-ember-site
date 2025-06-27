import supabase from '@/lib/supabase';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Converts a Date object to 'YYYY-MM-DD' using the machine's local timezone
 */
function formatLocalDate(date) {
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().split('T')[0];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const { startDate, endDate, limit = 50 } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Missing startDate or endDate in request body' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end) || start > end) {
    return res.status(400).json({ message: 'Invalid date range' });
  }

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (
    let current = new Date(start);
    current <= end && successCount < limit;
    current.setDate(current.getDate() + 1)
  ) {
    const formattedDate = formatLocalDate(current); // ✅ use local date

    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const date = current.getDate();

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
        observation_point: 'topocentric',
        ayanamsha: 'tropical',
        language: 'en',
      },
    };

    try {
      const apiRes = await fetch('https://json.freeastrologyapi.com/western/planets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ASTRO_API_KEY,
        },
        body: JSON.stringify(payload),
      });

      const data = await apiRes.json();

      if (!apiRes.ok) {
        results.push({ date: formattedDate, error: data });
        failCount++;
        continue;
      }

      const formattedData = {
        date: formattedDate,
        output: (data.output || []).map((item) => ({
          name: item.planet?.en || 'Unknown',
          fullDegree: item.fullDegree,
          normDegree: item.normDegree,
          isRetro: item.isRetro,
          zodiac: item.zodiac_sign?.en || item.zodiac_sign?.name?.en || 'Unknown',
        })),
        moon_phase: data.moonPhase || null,
      };

      const { error } = await supabase
        .from('daily_astro_api')
        .upsert([formattedData], { onConflict: ['date'] });

      if (error) {
        results.push({ date: formattedDate, error });
        failCount++;
      } else {
        results.push({ date: formattedDate, status: 'saved' });
        successCount++;
      }
    } catch (err) {
      results.push({ date: formattedDate, error: err.message });
      failCount++;
    }

    await delay(1000);
  }

  return res.status(200).json({
    message: `Astro data saved for ${successCount} days. ${failCount} failed.`,
    details: results,
  });
}
