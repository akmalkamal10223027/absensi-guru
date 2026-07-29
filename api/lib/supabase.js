import { createClient } from '@supabase/supabase-js';

// Singleton client
let supabaseInstance = null;

export function getSupabase() {
    if (!supabaseInstance) {
        supabaseInstance = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
    }
    return supabaseInstance;
}

export function getStorage() {
    return getSupabase().storage.from(
        process.env.SUPABASE_STORAGE_BUCKET || 'attendance-photos'
    );
}