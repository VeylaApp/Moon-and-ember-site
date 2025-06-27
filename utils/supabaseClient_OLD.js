import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config(); // Make sure this line is here if used in a script

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
