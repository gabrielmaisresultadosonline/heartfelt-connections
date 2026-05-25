import { createClient } from "@supabase/supabase-js";

// Publishable/anon key — seguro no bundle do browser
const SUPABASE_URL = "https://nvuwxepoehipkdgwwgwz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_5yHmaDdkbWnuCetLUwc7Hg_zRc20W0S";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const SUPABASE_PUBLIC_URL = SUPABASE_URL;
