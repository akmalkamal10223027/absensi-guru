import { getSupabase } from '../lib/supabase.js';
import { authenticate } from '../lib/auth.js';
import { jsonResponse, errorResponse } from '../lib/utils.js';

export async function GET(request) {
    const auth = await authenticate(request);
    if (auth.error) return errorResponse(auth.error, auth.status);

    const supabase = getSupabase();
    const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('date', { ascending: false })
        .limit(50);

    return jsonResponse({ data: data || [], total: data?.length || 0 });
}