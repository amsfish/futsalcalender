
import { createClient } from '@supabase/supabase-js';

// Vercelなどの環境で process.env が直接使えない場合を考慮
const getEnv = (key: string, fallback: string): string => {
  try {
    // @ts-ignore
    const value = process.env[key] || fallback;
    return value;
  } catch {
    return fallback;
  }
};

const supabaseUrl = getEnv('SUPABASE_URL', 'https://zosehxuroaofnufehljo.supabase.co');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY', 'sb_publishable_nfDXsZiqdjL__9S8QquxeKQ_tW3Xt-Im');

if (supabaseUrl === 'https://YOUR_PROJECT_URL.supabase.co') {
  console.warn('Supabase URL is not configured. Please check your Environment Variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
