// pages/api/set-session-cookie.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client here as well, potentially with service_role key
// For verifying tokens securely on the server, you should use the service_role key.
// However, for simply setting a cookie from the client's access_token,
// you can use the anon key if you prefer not to expose service_role key.
// For production, use the service_role key to verify the token for security.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Make sure this env var is set!

// Using anon key here for simplicity, but service_role is more secure for verification
const supabaseServer = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { accessToken, refreshToken, expiresIn } = req.body;

  if (!accessToken || !refreshToken || !expiresIn) {
    return res.status(400).json({ message: 'Missing session data' });
  }

  // --- OPTIONAL BUT RECOMMENDED: Verify the accessToken on the server ---
  // Requires supabaseServer to be initialized with service_roleKey for security
  // try {
  //   const { data: { user }, error } = await supabaseServer.auth.getUser(accessToken);
  //   if (error || !user) {
  //     console.error('Token verification failed:', error?.message);
  //     return res.status(401).json({ message: 'Invalid access token' });
  //   }
  //   console.log('Token verified for user:', user.email);
  // } catch (e) {
  //   console.error('Error verifying token:', e.message);
  //   return res.status(500).json({ message: 'Server error during token verification' });
  // }
  // --- END OPTIONAL VERIFICATION ---

  const expiresDate = new Date(Date.now() + expiresIn * 1000); // expiresIn is in seconds

  // Set the cookie.
  // - 'supabase_forum_session' is the name NodeBB expects.
  // - 'accessToken' is the JWT.
  // - 'Domain=.moonandembers.com' is CRITICAL for cross-subdomain access.
  // - 'Path=/' makes it available across the entire domain.
  // - 'Expires=' sets the expiration matching Supabase's token expiry.
  // - 'Secure' is CRITICAL because your forum is HTTPS.
  // - 'SameSite=Lax' is generally good for this context. 'SameSite=None' might be needed if Lax causes issues, but also requires Secure.
  // - HttpOnly=false is NECESSARY because NodeBB's session-sharing plugin reads this cookie via JS.
  res.setHeader('Set-Cookie', [
    `supabase_forum_session=${accessToken}; Domain=.moonandembers.com; Path=/; Expires=${expiresDate.toUTCString()}; Secure; SameSite=Lax`,
    // You might also want to set the refresh token if Supabase needs it from cookies for auto-refresh,
    // but NodeBB only cares about the access token.
    // `sb-refresh-token=${refreshToken}; Domain=.moonandembers.com; Path=/; Expires=${expiresDate.toUTCString()}; Secure; SameSite=Lax; HttpOnly`
  ]);

  res.status(200).json({ message: 'Session cookie set successfully' });
}