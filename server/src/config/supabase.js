// server/src/config/supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Menggunakan service role untuk bypass RLS di backend

export const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseStorage = supabase.storage.from(
    process.env.SUPABASE_STORAGE_BUCKET || 'attendance-photos'
);