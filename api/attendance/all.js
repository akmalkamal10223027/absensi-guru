import { getSupabase } from '../lib/supabase.js';
import { authenticate, authorize } from '../lib/auth.js';
import { jsonResponse, errorResponse } from '../lib/utils.js';

export async function GET(request) {
    const auth = await authenticate(request);
    if (auth.error) return errorResponse(auth.error, auth.status);
    if (!authorize(auth.user, 'admin')) return errorResponse('Akses ditolak', 403);

    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const status = url.searchParams.get('status');
    const start_date = url.searchParams.get('start_date');
    const end_date = url.searchParams.get('end_date');

    const supabase = getSupabase();
    let query = supabase
        .from('attendance')
        .select('*, users(full_name, nip, photo_url)');

    if (date) query = query.eq('date', date);
    else if (start_date && end_date) {
        query = query.gte('date', start_date).lte('date', end_date);
    }
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('date', { ascending: false });
    if (error) return errorResponse('Gagal ambil data', 500);

    return jsonResponse({ data: data || [], total: data?.length || 0 });
}