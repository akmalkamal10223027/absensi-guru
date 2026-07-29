import { getSupabase } from '../lib/supabase.js';
import { authenticate } from '../lib/auth.js';
import { jsonResponse, errorResponse } from '../lib/utils.js';
import { format } from 'date-fns';

export async function GET(request) {
    const auth = await authenticate(request);
    if (auth.error) return errorResponse(auth.error, auth.status);

    const today = format(new Date(), 'yyyy-MM-dd');
    const supabase = getSupabase();

    const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', auth.user.id)
        .eq('date', today)
        .maybeSingle();

    return jsonResponse({
        attendance: data,
        hasCheckedIn: !!data?.check_in_time,
        hasCheckedOut: !!data?.check_out_time
    });
}