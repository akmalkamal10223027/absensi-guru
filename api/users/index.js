import bcrypt from 'bcryptjs';
import { getSupabase } from '../lib/supabase.js';
import { authenticate, authorize } from '../lib/auth.js';
import { jsonResponse, errorResponse } from '../lib/utils.js';

export async function GET(request) {
    const auth = await authenticate(request);
    if (auth.error) return errorResponse(auth.error, auth.status);
    if (!authorize(auth.user, 'admin')) return errorResponse('Akses ditolak', 403);

    const supabase = getSupabase();
    const { data } = await supabase
        .from('users')
        .select('id, email, username, full_name, nip, photo_url, is_active, created_at, roles(name)')
        .order('created_at', { ascending: false });

    return jsonResponse({ data: data || [], total: data?.length || 0 });
}

export async function POST(request) {
    const auth = await authenticate(request);
    if (auth.error) return errorResponse(auth.error, auth.status);
    if (!authorize(auth.user, 'admin')) return errorResponse('Akses ditolak', 403);

    const { full_name, email, username, nip, password, role } = await request.json();

    if (!full_name || !email || !password || !role) {
        return errorResponse('Field wajib tidak boleh kosong', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const supabase = getSupabase();
    const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('name', role)
        .single();

    const { data, error } = await supabase
        .from('users')
        .insert([{
            full_name,
            email,
            username: username || null,
            nip: nip || null,
            password_hash: hashedPassword,
            role_id: roleData.id,
            is_active: true
        }])
        .select()
        .single();

    if (error) return errorResponse('Gagal membuat user', 500);
    return jsonResponse(data, 201);
}