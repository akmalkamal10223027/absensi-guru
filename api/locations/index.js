import { getSupabase } from '../lib/supabase.js';
import { authenticate, authorize } from '../lib/auth.js';
import { jsonResponse, errorResponse } from '../lib/utils.js';

export async function GET(request) {
    const auth = await authenticate(request);
    if (auth.error) return errorResponse(auth.error, auth.status);

    const supabase = getSupabase();
    const { data } = await supabase
        .from('school_locations')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    return jsonResponse({ data: data || [] });
}

export async function POST(request) {
    const auth = await authenticate(request);
    if (auth.error) return errorResponse(auth.error, auth.status);
    if (!authorize(auth.user, 'admin')) return errorResponse('Akses ditolak', 403);

    const { name, address, latitude, longitude, radius_meters, is_active } = await request.json();

    if (!name || !latitude || !longitude) {
        return errorResponse('Nama, latitude, dan longitude wajib diisi', 400);
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('school_locations')
        .insert([{
            name,
            address: address || '',
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            radius_meters: parseInt(radius_meters) || 100,
            is_active: is_active !== undefined ? is_active : true
        }])
        .select()
        .single();

    if (error) return errorResponse('Gagal membuat lokasi', 500);
    return jsonResponse(data, 201);
}