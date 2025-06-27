// pages/getAstroByDate.js
// This API retrieves daily Western astrology data for a specific date from Supabase.
import supabase from '@/lib/supabase'; // ✅ use shared instance

export default async function handler(req, res) {
  const { date } = req.query;

  if (!date) return res.status(400).json({ message: 'Date is required' });

  const { data, error } = await supabase
    .from('daily_astro_api')
    .select('*')
    .eq('date', date)
    .single();

  if (error || !data) {
    return res.status(404).json({ message: 'No data found for this date' });
  }

  res.status(200).json({ data });
}
