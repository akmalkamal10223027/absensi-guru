import { getSupabase } from '../lib/supabase.js';
import { authenticate, authorize } from '../lib/auth.js';
import { jsonResponse, errorResponse } from '../lib/utils.js';

export async function PUT(request, { params }) {
    const auth = await authenticate(request);
    if (auth.error) return errorResponse(auth.error, auth.status);
    if (!authorize(auth.user, 'admin')) return errorResponse('Akses ditolak', 403);

    const { full_name, email, username, nip, is_active } = await request.json();
    const updates = { updated_at: new Date().toISOString() };
    if (full_name) updates.full_name = full_name;
    if (email) updates.email = email;
    if (username) updates.username = username;
    if (nip) updates.nip = nip;
    if (is_active !== undefined) updates.is_active = is_active;

    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', params.id)
        .select()
        .single();

    if (error) return errorResponse('Gagal update user', 500);
    return jsonResponse(data);
}

export async function DELETE(request, { params }) {
    const auth = await authenticate(request);
    if (auth.error) return errorResponse(auth.error, auth.status);
    if (!authorize(auth.user, 'admin')) return errorResponse('Akses ditolak', 403);

    const supabase = getSupabase();
    const { error } = await supabase.from('users').delete().eq('id', params.id);

    if (error) return errorResponse('Gagal hapus user', 500);
    return jsonResponse({ message: 'User berhasil dihapus' });
}