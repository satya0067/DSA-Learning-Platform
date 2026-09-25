const { createClient } = require('@supabase/supabase-js');

const getUrl = () => 
  process.env.SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL;

const getKey = () => 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  process.env.SUPABASE_PUBLISHABLE_KEY || 
  process.env.SUPABASE_PUBLIC_KEY || 
  process.env.SUPABASE_KEY || 
  process.env.SUPABASE_API_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

function getSupabase() {
  const currentUrl = getUrl();
  const currentKey = getKey();

  if (!currentUrl || !currentKey) {
    throw new Error('Supabase environment variables (SUPABASE_URL and SUPABASE_ANON_KEY) are missing in Vercel Settings -> Environment Variables. Please add them and Redeploy.');
  }

  if (!supabase) {
    supabase = createClient(currentUrl, currentKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
  }
  return supabase;
}

module.exports = {
  supabase: getSupabase,
  getSupabase
};
