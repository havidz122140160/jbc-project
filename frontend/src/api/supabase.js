import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Hanya inisialisasi jika ada credentials asli
export const supabase = (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') 
  ? createClient(supabaseUrl, supabaseKey)
  : { 
      channel: () => ({ on: () => ({ subscribe: () => ({}) }) }), 
      removeChannel: () => {} 
    };
