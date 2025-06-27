// scripts/fetchDailyAstro.js

import { config } from 'dotenv';
config({ path: '.env.local' });

import axios from 'axios';
import supabase from '../lib/supabase'; // ✅ shared admin client

const ASTRO_KEY = process.env.ASTRO_API_KEY;

async function fetchAndSave() {
  const now = new Date();
  const [year, month, day, utcHour] = [
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    now.getUTCDate(),
    now.getUTCHours(),
  ];

  if (utcHour !== 0) {
    console.log('⏰ Not midnight UTC yet — exiting.');
    process.exit(0);
  }

  try {
    const planetRes = await axios.post(
      'https://json.freeastrologyapi.com/western/planets',
      {
        year,
        month,
        date: day,
        hours: 0,
        minutes: 0,
        seconds: 0,
        latitude: 0,
        longitude: 0,
        timezone: 0,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ASTRO_KEY,
        },
      }
    );

    const moonRes = await axios.post(
      'https://json.freeastrologyapi.com/complete-panchang',
      {
        year,
        month,
        date: day,
        hours: 0,
        minutes: 0,
        seconds: 0,
        latitude: 0,
        longitude: 0,
        timezone: 0,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ASTRO_KEY,
        },
      }
    );

    const sun = planetRes.data.planets.find((p) => p.name === 'Sun')?.sign || 'Unknown';
    const moon = planetRes.data.planets.find((p) => p.name === 'Moon')?.sign || 'Unknown';
    const retrogrades = planetRes.data.planets
      .filter((p) => p.is_retro)
      .map((p) => p.name);
    const moonPhase = moonRes.data.tithi?.name || 'Unknown';

    const { error } = await supabase.from('daily_astro').upsert({
      date: now.toISOString().split('T')[0],
      sun_sign: sun,
      moon_sign: moon,
      retrogrades,
      moon_phase: moonPhase,
    });

    if (error) {
      console.error('❌ Supabase error:', error);
    } else {
      console.log('✅ Astro data saved:', { sun, moon, retrogrades, moonPhase });
    }
  } catch (err) {
    console.error('❌ API error:', err.response?.data || err.message);
  }
}

fetchAndSave();
