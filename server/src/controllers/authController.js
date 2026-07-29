import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

// ============================================
// LOGIN
// ============================================
export const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ error: 'Email/username dan password wajib diisi' });
        }

        // Cari user berdasarkan email, username, atau NIP (Case-insensitive)
        const cleanIdentifier = identifier.trim().toLowerCase();
        const { data: users, error } = await supabase
            .from('users')
            .select('*, roles(name)')
            .or(`email.ilike.${cleanIdentifier},username.ilike.${cleanIdentifier},nip.ilike.${cleanIdentifier}`);

        if (error) {
            console.error('Supabase user query error:', error);
        }

        const user = users && users.length > 0 ? users[0] : null;

        if (!user) {
            console.warn(`User not found for identifier: ${identifier}`);
            return res.status(401).json({ error: 'Email/username atau password salah' });
        }

        // Cek apakah akun aktif (hanya blok jika secara tegas is_active === false)
        if (user.is_active === false) {
            return res.status(403).json({ error: 'Akun Anda telah dinonaktifkan. Hubungi administrator.' });
        }

        // Verifikasi password (Bcrypt hash atau fallback plaintext)
        let isValidPassword = false;
        if (user.password_hash && user.password_hash.startsWith('$2')) {
            isValidPassword = await bcrypt.compare(password, user.password_hash);
        }
        if (!isValidPassword) {
            isValidPassword = (password === user.password_hash);
        }

        if (!isValidPassword) {
            console.warn(`Invalid password attempt for user: ${user.username || user.email}`);
            return res.status(401).json({ error: 'Email/username atau password salah' });
        }

        // Normalisasi role
        const rawRole = user.roles?.name ||
            (Array.isArray(user.roles) ? user.roles[0]?.name : user.role) ||
            'guru';
        const roleName = String(rawRole).toLowerCase();

        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET || 'ganti-dengan-random-string-yang-panjang-dan-aman';
        const token = jwt.sign(
            { userId: user.id, role: roleName },
            jwtSecret,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                username: user.username,
                nip: user.nip,
                role: roleName,
                photo_url: user.photo_url
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: String(error?.message || error || 'Terjadi kesalahan pada server') });
    }
};

// ============================================
// GET PROFILE
// ============================================
export const getProfile = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*, roles(name)')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;

        // Normalisasi response
        const rawRole = user.roles?.name ||
            (Array.isArray(user.roles) ? user.roles[0]?.name : user.role) ||
            'guru';

        res.json({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            username: user.username,
            nip: user.nip,
            role: String(rawRole).toLowerCase(),
            photo_url: user.photo_url,
            is_active: user.is_active,
            created_at: user.created_at,
            updated_at: user.updated_at
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

// ============================================
// UPDATE PROFILE
// ============================================
export const updateProfile = async (req, res) => {
    try {
        const { full_name, email, username } = req.body;
        const userId = req.user.id;

        // Validasi input
        if (!full_name && !email && !username) {
            return res.status(400).json({ error: 'Minimal satu field harus diisi' });
        }

        // Cek apakah email sudah digunakan user lain
        if (email) {
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .neq('id', userId)
                .maybeSingle();

            if (existingUser) {
                return res.status(400).json({ error: 'Email sudah digunakan oleh user lain' });
            }
        }

        // Cek apakah username sudah digunakan user lain
        if (username) {
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('username', username)
                .neq('id', userId)
                .maybeSingle();

            if (existingUser) {
                return res.status(400).json({ error: 'Username sudah digunakan oleh user lain' });
            }
        }

        // Siapkan data update (hanya field yang diisi)
        const updates = {
            updated_at: new Date().toISOString()
        };
        if (full_name !== undefined) updates.full_name = full_name;
        if (email !== undefined) updates.email = email;
        if (username !== undefined) updates.username = username;

        // Update user
        const { data: updatedUser, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select('*, roles(name)')
            .single();

        if (error) throw error;

        // Normalisasi role
        const rawRole = updatedUser.roles?.name ||
            (Array.isArray(updatedUser.roles) ? updatedUser.roles[0]?.name : updatedUser.role) ||
            'guru';

        res.json({
            id: updatedUser.id,
            full_name: updatedUser.full_name,
            email: updatedUser.email,
            username: updatedUser.username,
            nip: updatedUser.nip,
            role: String(rawRole).toLowerCase(),
            photo_url: updatedUser.photo_url,
            is_active: updatedUser.is_active,
            updated_at: updatedUser.updated_at
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui profil' });
    }
};

// ============================================
// CHANGE PASSWORD
// ============================================
export const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        const userId = req.user.id;

        // Validasi input
        if (!current_password || !new_password) {
            return res.status(400).json({
                error: 'Password saat ini dan password baru wajib diisi'
            });
        }

        // Validasi panjang password baru
        if (new_password.length < 8) {
            return res.status(400).json({
                error: 'Password baru minimal 8 karakter'
            });
        }

        // Validasi password baru tidak sama dengan password lama
        if (current_password === new_password) {
            return res.status(400).json({
                error: 'Password baru tidak boleh sama dengan password saat ini'
            });
        }

        // Ambil data user dari database
        const { data: user, error } = await supabase
            .from('users')
            .select('password_hash')
            .eq('id', userId)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        // Verifikasi password saat ini (Bcrypt hash atau fallback plaintext)
        let isValidPassword = false;
        if (user.password_hash && user.password_hash.startsWith('$2')) {
            isValidPassword = await bcrypt.compare(current_password, user.password_hash);
        } else {
            isValidPassword = (current_password === user.password_hash);
        }

        if (!isValidPassword) {
            return res.status(400).json({ error: 'Password saat ini salah' });
        }

        // Hash password baru
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update password di database
        const { error: updateError } = await supabase
            .from('users')
            .update({
                password_hash: hashedPassword,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) throw updateError;

        res.json({
            message: 'Password berhasil diubah',
            updated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengubah password' });
    }
};

// ============================================
// UPLOAD PHOTO PROFILE (Bonus)
// ============================================
export const uploadPhoto = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ error: 'File foto diperlukan' });
        }

        // Upload ke Supabase Storage
        const fileName = `avatars/${userId}_${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
            .from('attendance-photos')
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: true
            });

        if (uploadError) throw uploadError;

        // Dapatkan public URL
        const { data: urlData } = supabase.storage
            .from('attendance-photos')
            .getPublicUrl(fileName);

        const photoUrl = urlData.publicUrl;

        // Update user dengan URL foto baru
        const { error: updateError } = await supabase
            .from('users')
            .update({
                photo_url: photoUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) throw updateError;

        res.json({
            message: 'Foto profil berhasil diupload',
            photo_url: photoUrl
        });
    } catch (error) {
        console.error('Upload photo error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat upload foto' });
    }
};