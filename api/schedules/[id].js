import { getSupabase } from '../lib/supabase.js';
import { authenticate, authorize } from '../lib/auth.js';
import { jsonResponse, errorResponse } from '../lib/utils.js';

export async function PUT(request, { params }) {
    const auth = await authenticate(request);
    if (auth.error) return errorResponse(auth.error, auth.status);
    if (!authorize(auth.user, 'admin')) return errorResponse('Akses ditolak', 403);

    const { day_of_week, start_time, end_time, late_threshold_minutes, is_active } = await request.json();
    const updates = { updated_at: new Date().toISOString() };
    if (day_of_week !== undefined) updates.day_of_week = parseInt(day_of_week);
    if (start_time) updates.start_time = start_time;
    if (end_time) updates.end_time = end_time;
    if (late_threshold_minutes !== undefined) updates.late_threshold_minutes = parseInt(late_threshold_minutes);
    if (is_active !== undefined) updates.is_active = is_active;

    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('work_schedules')
        .update(updates)
        .eq('id', params.id)
        .select()
        .single();

    if (error) return errorResponse('Gagal update jadwal', 500);
    return jsonResponse(data);
}