// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ✅ Check for auth cookie presence (only in browser)
function hasSessionCookie() {
  if (typeof document === 'undefined') return false
  return (
    document.cookie.includes('sb-access-token') &&
    document.cookie.includes('sb-refresh-token')
  )
}

let supabase = null

if (typeof window === 'undefined') {
  // SSR - allow Supabase to be created (safe, won’t trigger auth)
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else if (hasSessionCookie()) {
  // Client-side AND session cookie present
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export default supabase
