import { getSupabase, getStorage } from '../lib/supabase.js';
import { authenticate } from '../lib/auth.js';
import { jsonResponse, errorResponse, parseFormData } from '../lib/utils.js';
import { format } from 'date-fns';

export async function POST(request) {
    const auth = await authenticate(request);
    if (auth.error) return errorResponse(auth.error, auth.status);

    try {
        const formData = await parseFormData(request);
        const userId = auth.user.id;
        const today = format(new Date(), 'yyyy-MM-dd');

        const supabase = getSupabase();

        const { data: attendance } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .maybeSingle();

        if (!attendance) {
            return errorResponse('Belum melakukan absen masuk hari ini', 400);
        }

        if (attendance.check_out_time) {
            return errorResponse('Anda sudah melakukan absen pulang hari ini', 400);
        }

        let photoUrl = null;
        if (formData.photo) {
            const fileName = `${userId}/${today}_checkout_${Date.now()}.jpg`;
            await getStorage().upload(fileName, formData.photo.buffer, {
                contentType: formData.photo.mimetype
            });
            const { data } = getStorage().getPublicUrl(fileName);
            photoUrl = data.publicUrl;
        }

        const { data: updated, error } = await supabase
            .from('attendance')
            .update({
                check_out_time: new Date().toISOString(),
                check_out_photo_url: photoUrl,
                check_out_latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                check_out_longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                updated_at: new Date().toISOString()
            })
            .eq('id', attendance.id)
            .select()
            .single();

        if (error) throw error;

        return jsonResponse({ message: 'Absen pulang berhasil', attendance: updated });
    } catch (error) {
        console.error('Check-out error:', error);
        return errorResponse('Terjadi kesalahan saat absen pulang', 500);
    }
}