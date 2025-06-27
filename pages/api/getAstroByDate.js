// pages/api/getAstroByDate.js
import supabase from '@/lib/supabase'; // ✅ Use the singleton client

export default async function handler(req, res) {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  console.log('🔍 Fetching from Supabase for date:', date);

  const { data, error } = await supabase
    .from('daily_astro_api')
    .select('*')
    .eq('date', date)
    .maybeSingle();

  console.log('📦 Supabase response:', { data, error });

  if (error) {
    return res.status(500).json({ message: 'Supabase error', error });
  }

  if (!data) {
    return res.status(404).json({ message: 'No data found for this date' });
  }

  res.status(200).json({ data });
}

