// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function hasSessionCookie() {
  if (typeof document === 'undefined') return false
  return (
    document.cookie.includes('sb-access-token') &&
    document.cookie.includes('sb-refresh-token')
  )
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: hasSessionCookie(),
    autoRefreshToken: hasSessionCookie()
  }
})

export default supabase
