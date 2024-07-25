import { createClient, SupabaseClient } from "@supabase/supabase-js";

let localDbInstance: SupabaseClient | null = null;

function initDb() {
  localDbInstance = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );
  return localDbInstance;
}

export const dbInstance = localDbInstance ?? initDb();
