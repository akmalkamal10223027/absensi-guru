import { supabase } from '../config/supabase.js';

export const getAllLocations = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('school_locations')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json({ data: data || [] });
    } catch (error) {
        console.error('Get locations error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

export const createLocation = async (req, res) => {
    try {
        const { name, address, latitude, longitude, radius_meters, is_active } = req.body;

        if (!name || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: 'Nama, latitude, dan longitude wajib diisi' });
        }

        const { data, error } = await supabase
            .from('school_locations')
            .insert([{
                name,
                address,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                radius_meters: parseInt(radius_meters) || 100,
                is_active: is_active !== undefined ? is_active : true
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Create location error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menambah lokasi' });
    }
};

export const updateLocation = async (req, res) => {
    try {
        const { name, address, latitude, longitude, radius_meters, is_active } = req.body;

        const updates = {};
        if (name) updates.name = name;
        if (address !== undefined) updates.address = address;
        if (latitude !== undefined) updates.latitude = parseFloat(latitude);
        if (longitude !== undefined) updates.longitude = parseFloat(longitude);
        if (radius_meters !== undefined) updates.radius_meters = parseInt(radius_meters);
        if (is_active !== undefined) updates.is_active = is_active;

        const { data, error } = await supabase
            .from('school_locations')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui lokasi' });
    }
};
