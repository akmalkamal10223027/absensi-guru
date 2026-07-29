import { getSupabase } from '../lib/supabase.js';
import { authenticate, authorize } from '../lib/auth.js';
import { jsonResponse, errorResponse } from '../lib/utils.js';
import { format } from 'date-fns';

export async function GET(request) {
    const auth = await authenticate(request);
    if (auth.error) return errorResponse(auth.error, auth.status);
    if (!authorize(auth.user, 'admin')) return errorResponse('Akses ditolak', 403);

    const today = format(new Date(), 'yyyy-MM-dd');
    const supabase = getSupabase();

    const { data } = await supabase
        .from('attendance')
        .select('*, users(full_name, nip, photo_url)')
        .eq('date', today)
        .order('check_in_time', { ascending: false })
        .limit(10);

    return jsonResponse({ data: data || [] });
}