import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY — usa service role (bypassa RLS). Nunca importar no browser.
function getAdmin() {
  const url = process.env.EXTERNAL_SUPABASE_URL;
  const key = process.env.EXTERNAL_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("EXTERNAL_SUPABASE_URL e EXTERNAL_SUPABASE_SERVICE_ROLE_KEY são obrigatórios");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const supabaseAdmin = new Proxy({} as ReturnType<typeof getAdmin>, {
  get(_t, prop) {
    const client = getAdmin();
    // @ts-expect-error dynamic
    return client[prop];
  },
});
