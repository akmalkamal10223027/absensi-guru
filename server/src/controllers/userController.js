import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

export const getAllUsers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, username, full_name, nip, photo_url, is_active, created_at, roles(name)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ data, total: data?.length || 0 });
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

export const createUser = async (req, res) => {
    try {
        const { full_name, email, username, nip, password, role } = req.body;

        if (!full_name || !email || !password || !role) {
            return res.status(400).json({ error: 'Field wajib tidak boleh kosong' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data: roleData } = await supabase
            .from('roles')
            .select('id')
            .eq('name', role)
            .single();

        const { data, error } = await supabase
            .from('users')
            .insert([{
                full_name,
                email,
                username: username || null,
                nip: nip || null,
                password_hash: hashedPassword,
                role_id: roleData.id,
                is_active: true
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat membuat user' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { full_name, email, username, nip, is_active } = req.body;

        const { data, error } = await supabase
            .from('users')
            .update({
                full_name: full_name || undefined,
                email: email || undefined,
                username: username || undefined,
                nip: nip || undefined,
                is_active: is_active !== undefined ? is_active : undefined,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui user' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { error } = await supabase.from('users').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: 'User berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus user' });
    }
};