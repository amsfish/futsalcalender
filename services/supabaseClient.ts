
import { createClient } from '@supabase/supabase-js';

// これらの値は通常、process.env から読み込みますが、
// 今回は動作確認のためプレースホルダーとして定義します。
// 実際の運用では Supabase の管理画面から取得した値を設定してください。
const supabaseUrl = (process.env.SUPABASE_URL as string) || 'https://your-project-url.supabase.co';
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY as string) || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
