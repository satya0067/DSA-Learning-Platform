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

const { getLocalDb } = require('./localDb');

let supabase = null;

function getSupabase() {
  if (process.env.USE_LOCAL_DB === 'true') {
    return getLocalDb();
  }

  const currentUrl = getUrl();
  const currentKey = getKey();

  if (!currentUrl || !currentKey) {
    return getLocalDb();
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
