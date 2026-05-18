import { useEffect } from 'react';
import { supabase } from '../api/supabase';

export const useRealtime = (table, callback) => {
  useEffect(() => {
    // Cek apakah Supabase sudah di-config dengan benar
    const isConfigured = supabase.supabaseUrl && supabase.supabaseKey &&
                         !supabase.supabaseUrl.includes('your-project') && 
                         !supabase.supabaseKey.includes('your-anon-key');
    
    if (!isConfigured) {
      console.warn("Supabase real-time disabled: Placeholder credentials detected.");
      return;
    }

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: table,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback]);
};
