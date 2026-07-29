import { supabase } from '../config/supabase.js';

export const getAllSchedules = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('work_schedules')
            .select('*')
            .order('day_of_week');

        if (error) throw error;
        res.json({ data: data || [] });
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

export const createSchedule = async (req, res) => {
    try {
        const { day_of_week, start_time, end_time, late_threshold_minutes, is_active } = req.body;

        if (day_of_week === undefined || !start_time || !end_time) {
            return res.status(400).json({ error: 'Field wajib tidak boleh kosong' });
        }

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

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Create schedule error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat membuat jadwal' });
    }
};

export const updateSchedule = async (req, res) => {
    try {
        const { day_of_week, start_time, end_time, late_threshold_minutes, is_active } = req.body;

        const updates = {};
        if (day_of_week !== undefined) updates.day_of_week = parseInt(day_of_week);
        if (start_time) updates.start_time = start_time;
        if (end_time) updates.end_time = end_time;
        if (late_threshold_minutes !== undefined) updates.late_threshold_minutes = parseInt(late_threshold_minutes);
        if (is_active !== undefined) updates.is_active = is_active;

        const { data, error } = await supabase
            .from('work_schedules')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui jadwal' });
    }
};