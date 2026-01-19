
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase設定ガイド:
 * 1. Supabaseプロジェクトの Settings > API を開く
 * 2. Project URL を下記の supabaseUrl にコピー
 * 3. anon public key を下記の supabaseAnonKey にコピー
 * 
 * Vercel等にデプロイする場合は、環境変数 SUPABASE_URL, SUPABASE_ANON_KEY に設定してください。
 */
const supabaseUrl = (process.env.SUPABASE_URL as string) || 'https://zosehxuroaofnufehljo.supabase.co';
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY as string) || 'sb_publishable_nfDXsZiqdjL__9S8QquxeKQ_tW3Xt-Im';

if (supabaseUrl.includes('YOUR_PROJECT_URL')) {
  console.warn('Supabase URL is not configured. Please check services/supabaseClient.ts');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
