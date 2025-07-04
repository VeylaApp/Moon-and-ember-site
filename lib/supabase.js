// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Don't trigger token refresh spam on first load with no session
const hasCookies =
  typeof document !== 'undefined' &&
  document.cookie.includes('sb-access-token') &&
  document.cookie.includes('sb-refresh-token')

// Default to true on SSR and after login, false only on early cold-load
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window === 'undefined' || hasCookies,
    autoRefreshToken: typeof window === 'undefined' || hasCookies
  }
})

export default supabase
