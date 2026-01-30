
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nlnjxelldwoyllwpetnd.supabase.co';
const supabaseAnonKey = 'sb_publishable_OmM8e8nRD2Yi-uF6damGNA_XKA50tR2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
