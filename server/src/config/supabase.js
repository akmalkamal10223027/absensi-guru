import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are missing!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseStorage = supabase.storage.from(
    process.env.SUPABASE_STORAGE_BUCKET || 'attendance-photos'
);