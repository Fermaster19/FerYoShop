const SUPABASE_URL = 'https://febfdwrmtbwdxiziqlba.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Wz-rcjQ5daTBCwGOMOX8DA_cYfech1R';

window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
