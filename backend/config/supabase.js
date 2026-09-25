const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  process.env.SUPABASE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

function getSupabase() {
  if (!supabase) {
    const currentUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const currentKey = 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      process.env.SUPABASE_ANON_KEY || 
      process.env.SUPABASE_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!currentUrl || !currentKey) {
      throw new Error('Supabase environment variables (SUPABASE_URL and SUPABASE_ANON_KEY) are missing.');
    }

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
