import { getSupabase, getStorage } from '../lib/supabase.js';
import { authenticate } from '../lib/auth.js';
import { jsonResponse, errorResponse, calculateDistance, parseFormData } from '../lib/utils.js';
import { format } from 'date-fns';

export async function POST(request) {
    const auth = await authenticate(request);
    if (auth.error) return errorResponse(auth.error, auth.status);

    try {
        const formData = await parseFormData(request);
        const { latitude, longitude, notes } = formData;
        const userId = auth.user.id;
        const today = format(new Date(), 'yyyy-MM-dd');

        const supabase = getSupabase();

        // Cek sudah check-in belum
        const { data: existing } = await supabase
            .from('attendance')
            .select('id')
            .eq('user_id', userId)
            .eq('date', today)
            .maybeSingle();

        if (existing) {
            return errorResponse('Anda sudah melakukan absen masuk hari ini', 400);
        }

        // Ambil lokasi sekolah
        const { data: locations } = await supabase
            .from('school_locations')
            .select('*')
            .eq('is_active', true)
            .limit(1);

        if (!locations || locations.length === 0) {
            return errorResponse('Lokasi sekolah belum dikonfigurasi', 400);
        }

        const school = locations[0];
        const distance = calculateDistance(
            parseFloat(latitude), parseFloat(longitude),
            parseFloat(school.latitude), parseFloat(school.longitude)
        );

        if (distance > school.radius_meters) {
            return errorResponse(
                `Anda berada di luar area sekolah. Jarak: ${Math.round(distance)}m, Radius: ${school.radius_meters}m`,
                400
            );
        }

        // Upload foto
        let photoUrl = null;
        if (formData.photo) {
            const fileName = `${userId}/${today}_checkin_${Date.now()}.jpg`;
            photoUrl = await getStorage().upload(fileName, formData.photo.buffer, {
                contentType: formData.photo.mimetype
            }).then(() => {
                const { data } = getStorage().getPublicUrl(fileName);
                return data.publicUrl;
            });
        }

        // Cek jadwal untuk status
        const dayOfWeek = new Date().getDay();
        const { data: schedule } = await supabase
            .from('work_schedules')
            .select('*')
            .eq('day_of_week', dayOfWeek)
            .eq('is_active', true)
            .maybeSingle();

        let status = 'hadir';
        if (schedule) {
            const now = new Date();
            const [startHour, startMinute] = schedule.start_time.split(':');
            const lateTime = new Date(now);
            lateTime.setHours(
                parseInt(startHour),
                parseInt(startMinute) + (schedule.late_threshold_minutes || 15),
                0
            );
            if (now > lateTime) status = 'terlambat';
        }

        const { data: attendance, error } = await supabase
            .from('attendance')
            .insert([{
                user_id: userId,
                date: today,
                check_in_time: new Date().toISOString(),
                check_in_photo_url: photoUrl,
                check_in_latitude: parseFloat(latitude),
                check_in_longitude: parseFloat(longitude),
                status,
                distance_meters: Math.round(distance),
                notes: notes || null
            }])
            .select()
            .single();

        if (error) throw error;

        return jsonResponse({
            message: 'Absen masuk berhasil',
            attendance,
            distance: Math.round(distance),
            status
        });
    } catch (error) {
        console.error('Check-in error:', error);
        return errorResponse('Terjadi kesalahan saat absen masuk', 500);
    }
}