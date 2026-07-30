import { supabase, supabaseStorage } from '../config/supabase.js';
import { format } from 'date-fns';

// Helper untuk mendapatkan informasi tanggal & waktu dalam zona WIB (Asia/Jakarta)
const getWibInfo = () => {
    const nowWib = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const today = format(nowWib, 'yyyy-MM-dd');
    const dayOfWeek = nowWib.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
    const currentMinutes = nowWib.getHours() * 60 + nowWib.getMinutes();
    return { nowWib, today, dayOfWeek, currentMinutes };
};

// Haversine formula untuk hitung jarak
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

export const checkIn = async (req, res) => {
    try {
        const { latitude, longitude, notes } = req.body;
        const userId = req.user.id;
        const { today, dayOfWeek, currentMinutes } = getWibInfo();

        // Cek apakah sudah check-in hari ini
        const { data: existing } = await supabase
            .from('attendance')
            .select('id')
            .eq('user_id', userId)
            .eq('date', today)
            .maybeSingle();

        if (existing) {
            return res.status(400).json({ error: 'Anda sudah melakukan absen masuk hari ini' });
        }

        // Ambil lokasi sekolah
        const { data: locations } = await supabase
            .from('school_locations')
            .select('*')
            .eq('is_active', true)
            .limit(1);

        if (!locations || locations.length === 0) {
            return res.status(400).json({ error: 'Lokasi sekolah belum dikonfigurasi' });
        }

        const school = locations[0];
        const distance = calculateDistance(
            parseFloat(latitude), parseFloat(longitude),
            parseFloat(school.latitude), parseFloat(school.longitude)
        );

        if (distance > school.radius_meters) {
            return res.status(400).json({
                error: `Anda berada di luar area sekolah. Jarak: ${Math.round(distance)}m, Radius: ${school.radius_meters}m`
            });
        }

        // Upload foto ke Supabase Storage
        let photoUrl = null;
        if (req.file) {
            const fileName = `${userId}/${today}_checkin_${Date.now()}.jpg`;
            const { error: uploadError } = await supabaseStorage.upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabaseStorage.getPublicUrl(fileName);
            photoUrl = urlData.publicUrl;
        }

        // Cek jadwal kerja untuk tentukan status keterlambatan
        const { data: schedule } = await supabase
            .from('work_schedules')
            .select('*')
            .eq('day_of_week', dayOfWeek)
            .eq('is_active', true)
            .maybeSingle();

        const startTimeStr = schedule?.start_time || '07:00:00';
        const lateThresholdMinutes = schedule?.late_threshold_minutes ?? 15;

        const [startHour, startMinute] = startTimeStr.split(':');
        const lateThreshold = (parseInt(startHour) * 60) + parseInt(startMinute) + parseInt(lateThresholdMinutes);

        let status = 'hadir';
        if (currentMinutes > lateThreshold) {
            status = 'terlambat';
        }

        // Simpan data absensi
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

        res.json({
            message: 'Absen masuk berhasil',
            attendance,
            distance: Math.round(distance),
            status
        });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat melakukan absen masuk' });
    }
};

export const checkOut = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const userId = req.user.id;
        const { today } = getWibInfo();

        const { data: attendance, error: findError } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single();

        if (findError || !attendance) {
            return res.status(400).json({ error: 'Belum melakukan absen masuk hari ini' });
        }

        if (attendance.check_out_time) {
            return res.status(400).json({ error: 'Anda sudah melakukan absen pulang hari ini' });
        }

        let photoUrl = null;
        if (req.file) {
            const fileName = `${userId}/${today}_checkout_${Date.now()}.jpg`;
            const { error: uploadError } = await supabaseStorage.upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabaseStorage.getPublicUrl(fileName);
            photoUrl = urlData.publicUrl;
        }

        const { data: updated, error: updateError } = await supabase
            .from('attendance')
            .update({
                check_out_time: new Date().toISOString(),
                check_out_photo_url: photoUrl || attendance.check_out_photo_url,
                check_out_latitude: latitude ? parseFloat(latitude) : attendance.check_out_latitude,
                check_out_longitude: longitude ? parseFloat(longitude) : attendance.check_out_longitude,
                updated_at: new Date().toISOString()
            })
            .eq('id', attendance.id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({
            message: 'Absen pulang berhasil',
            attendance: updated
        });
    } catch (error) {
        console.error('Check-out error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat melakukan absen pulang' });
    }
};

export const getTodayAttendance = async (req, res) => {
    try {
        const userId = req.user.id;
        const { today } = getWibInfo();

        const { data: attendance, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .maybeSingle();

        if (error) throw error;

        const hasCheckedIn = !!attendance;
        const hasCheckedOut = !!(attendance && attendance.check_out_time);

        res.json({
            attendance: attendance || null,
            hasCheckedIn,
            hasCheckedOut
        });
    } catch (error) {
        console.error('getTodayAttendance error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

export const getAttendanceHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { start_date, end_date } = req.query;

        let query = supabase
            .from('attendance')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (start_date) query = query.gte('date', start_date);
        if (end_date) query = query.lte('date', end_date);

        const { data, error } = await query;
        if (error) throw error;

        res.json({ data });
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil riwayat absensi' });
    }
};

export const getAllAttendance = async (req, res) => {
    try {
        const { date, user_id, status } = req.query;

        let query = supabase
            .from('attendance')
            .select('*, users(full_name, email, nip)')
            .order('created_at', { ascending: false });

        if (date) query = query.eq('date', date);
        if (user_id) query = query.eq('user_id', user_id);
        if (status) query = query.eq('status', status);

        const { data, error } = await query;
        if (error) throw error;

        res.json({ data, total: data?.length || 0 });
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data absensi' });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const { today } = getWibInfo();

        const { count: totalUsers } = await supabase
            .from('users')
            .select('id', { count: 'exact', head: true });

        const { data: todayAttendance } = await supabase
            .from('attendance')
            .select('status')
            .eq('date', today);

        const hadir = todayAttendance?.filter(a => a.status === 'hadir').length || 0;
        const terlambat = todayAttendance?.filter(a => a.status === 'terlambat').length || 0;
        const totalAbsen = (todayAttendance?.length) || 0;
        const totalGuru = totalUsers || 0;
        const tidakHadir = totalGuru - totalAbsen > 0 ? totalGuru - totalAbsen : 0;

        const hadirPercentage = totalGuru > 0 ? Math.round((hadir / totalGuru) * 100) : 0;
        const terlambatPercentage = totalGuru > 0 ? Math.round((terlambat / totalGuru) * 100) : 0;
        const tidakHadirPercentage = totalGuru > 0 ? Math.round((tidakHadir / totalGuru) * 100) : 0;

        const stats = {
            totalGuru,
            hadir,
            terlambat,
            tidakHadir,
            hadirPercentage,
            terlambatPercentage,
            tidakHadirPercentage
        };

        res.json({
            stats,
            dailyStats: [],
            todayStats: {
                hadir,
                terlambat,
                belumAbsen: tidakHadir,
                totalAbsen
            }
        });
    } catch (error) {
        console.error('getDashboardStats error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil statistik dashboard' });
    }
};

export const getRecentAttendance = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('attendance')
            .select('*, users(full_name, photo_url)')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('getRecentAttendance error:', error);
            return res.json({ data: [] });
        }
        res.json({ data: data || [] });
    } catch (error) {
        console.error('getRecentAttendance catch error:', error);
        res.json({ data: [] });
    }
};
