import { getSupabase } from '../lib/supabase.js';
import { authenticate, authorize } from '../lib/auth.js';
import { jsonResponse, errorResponse } from '../lib/utils.js';

export async function GET(request) {
    const auth = await authenticate(request);
    if (auth.error) return errorResponse(auth.error, auth.status);

    const supabase = getSupabase();
    const { data } = await supabase
        .from('work_schedules')
        .select('*')
        .order('day_of_week');

    return jsonResponse({ data: data || [] });
}

export async function POST(request) {
    const auth = await authenticate(request);
    if (auth.error) return errorResponse(auth.error, auth.status);
    if (!authorize(auth.user, 'admin')) return errorResponse('Akses ditolak', 403);

    const { day_of_week, start_time, end_time, late_threshold_minutes, is_active } = await request.json();

    if (day_of_week === undefined || !start_time || !end_time) {
        return errorResponse('Field wajib tidak boleh kosong', 400);
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('work_schedules')
        .insert([{
            day_of_week: parseInt(day_of_week),
            start_time,
            end_time,
            late_threshold_minutes: parseInt(late_threshold_minutes) || 15,
            is_active: is_active !== undefined ? is_active : true
        }])
        .select()
        .single();

    if (error) return errorResponse('Gagal membuat jadwal', 500);
    return jsonResponse(data, 201);
}