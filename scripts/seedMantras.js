// scripts/seedMantras.js

import { config } from 'dotenv';
config({ path: '.env.local' });

import supabase from '../../lib/supabase'; // ✅ use shared instance

const mantras = [
  {
    date: '2025-06-19',
    text: 'I trust the unknown and find magic in what is unseen.',
    energy: 'Moon trine Neptune',
  },
  {
    date: '2025-06-20',
    text: 'I rise with the fire within me, ready to transmute and transform.',
    energy: 'Mars sextile Pluto',
  },
  {
    date: '2025-06-21',
    text: 'Stillness is sacred. I am safe in silence.',
    energy: 'Sun enters Cancer',
  },
  {
    date: '2025-06-22',
    text: 'My truth is enough. My essence is divine.',
    energy: 'Venus in Leo square Saturn',
  },
  {
    date: '2025-06-23',
    text: 'I let go with grace. I am held in sacred rhythm.',
    energy: 'Waning Gibbous Moon',
  },
  {
    date: '2025-06-24',
    text: 'I plant intention in darkness and trust it will bloom.',
    energy: 'Void-of-Course Moon',
  },
  {
    date: '2025-06-25',
    text: 'What is meant for me cannot pass me by.',
    energy: 'Moon trine Jupiter',
  },
  {
    date: '2025-06-26',
    text: 'Even in chaos, I am the calm center.',
    energy: 'Mercury square Uranus',
  },
  {
    date: '2025-06-27',
    text: 'My energy is sacred. I direct it with clarity.',
    energy: 'Mars in Gemini',
  },
  {
    date: '2025-06-28',
    text: 'Softness is power. Vulnerability is strength.',
    energy: 'Venus trine Neptune',
  },
  {
    date: '2025-06-29',
    text: 'I embody grace, even when I tremble.',
    energy: 'Last Quarter Moon',
  },
  {
    date: '2025-06-30',
    text: 'I remember who I am — wild, whole, and worthy.',
    energy: 'Sun trine Moon',
  },
];

async function seedMantras() {
  for (const mantra of mantras) {
    try {
      const { data, error } = await supabase.from('mantra').insert([mantra]); // ✅ match table name exactly

      if (error) {
        console.error(`❌ Error inserting mantra for ${mantra.date}:`, error.message);
        console.log('🚨 Offending object:', mantra);
      } else {
        console.log(`✨ Successfully inserted mantra for ${mantra.date}`);
      }
    } catch (err) {
      console.error(`🔥 Exception on ${mantra.date}:`, err);
    }
  }
}

seedMantras();
