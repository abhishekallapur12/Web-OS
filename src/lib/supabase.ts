
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gcsbqrlzycrkobhzqkyg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjc2Jxcmx6eWNya29iaHpxa3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NjkyNzQsImV4cCI6MjA3MDI0NTI3NH0.IVsICWZg4PJVHqwpDxUm_Pxk1enotdz4JOabHb0wzVI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
