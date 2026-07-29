import bcrypt from 'bcryptjs';
import { getSupabase } from '../lib/supabase.js';
import { authenticate } from '../lib/auth.js';
import { jsonResponse, errorResponse } from '../lib/utils.js';

export async function PUT(request) {
    const auth = await authenticate(request);
    if (auth.error) return errorResponse(auth.error, auth.status);

    const { current_password, new_password } = await request.json();

    if (!current_password || !new_password) {
        return errorResponse('Password saat ini dan baru wajib diisi', 400);
    }

    if (new_password.length < 8) {
        return errorResponse('Password baru minimal 8 karakter', 400);
    }

    const supabase = getSupabase();
    const { data: user } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', auth.user.id)
        .single();

    const isValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isValid) return errorResponse('Password saat ini salah', 400);

    const hashedPassword = await bcrypt.hash(new_password, 10);

    const { error } = await supabase
        .from('users')
        .update({ password_hash: hashedPassword, updated_at: new Date().toISOString() })
        .eq('id', auth.user.id);

    if (error) return errorResponse('Gagal mengubah password', 500);
    return jsonResponse({ message: 'Password berhasil diubah' });
}