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

    const { count: totalGuru } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

    const { data: todayAttendance } = await supabase
        .from('attendance')
        .select('status')
        .eq('date', today);

    const hadir = todayAttendance?.filter(a => a.status === 'hadir').length || 0;
    const terlambat = todayAttendance?.filter(a => a.status === 'terlambat').length || 0;
    const tidakHadir = Math.max(0, (totalGuru || 0) - hadir - terlambat);

    const thirtyDaysAgo = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    const { data: dailyData } = await supabase
        .from('attendance')
        .select('date, status')
        .gte('date', thirtyDaysAgo)
        .lte('date', today);

    const dailyStats = {};
    dailyData?.forEach(record => {
        if (!dailyStats[record.date]) {
            dailyStats[record.date] = { hadir: 0, terlambat: 0, tidak_hadir: 0 };
        }
        if (record.status === 'hadir') dailyStats[record.date].hadir++;
        else if (record.status === 'terlambat') dailyStats[record.date].terlambat++;
        else dailyStats[record.date].tidak_hadir++;
    });

    const dailyStatsArray = Object.entries(dailyStats).map(([date, counts]) => ({
        date,
        ...counts
    }));

    return jsonResponse({
        stats: {
            totalGuru: totalGuru || 0,
            hadir,
            terlambat,
            tidakHadir,
            hadirPercentage: totalGuru ? Math.round((hadir / totalGuru) * 100) : 0,
            terlambatPercentage: totalGuru ? Math.round((terlambat / totalGuru) * 100) : 0,
            tidakHadirPercentage: totalGuru ? Math.round((tidakHadir / totalGuru) * 100) : 0
        },
        dailyStats: dailyStatsArray
    });
}