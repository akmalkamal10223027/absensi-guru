import { getSupabase } from '../lib/supabase.js';
import { authenticate, authorize } from '../lib/auth.js';
import { jsonResponse, errorResponse } from '../lib/utils.js';

export async function PUT(request, { params }) {
    const auth = await authenticate(request);
    if (auth.error) return errorResponse(auth.error, auth.status);
    if (!authorize(auth.user, 'admin')) return errorResponse('Akses ditolak', 403);

    const { name, address, latitude, longitude, radius_meters, is_active } = await request.json();
    const updates = { updated_at: new Date().toISOString() };
    if (name) updates.name = name;
    if (address !== undefined) updates.address = address;
    if (latitude) updates.latitude = parseFloat(latitude);
    if (longitude) updates.longitude = parseFloat(longitude);
    if (radius_meters !== undefined) updates.radius_meters = parseInt(radius_meters);
    if (is_active !== undefined) updates.is_active = is_active;

    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('school_locations')
        .update(updates)
        .eq('id', params.id)
        .select()
        .single();

    if (error) return errorResponse('Gagal update lokasi', 500);
    return jsonResponse(data);
}