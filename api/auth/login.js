import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSupabase } from '../lib/supabase.js';
import { jsonResponse, errorResponse } from '../lib/utils.js';

export async function POST(request) {
    try {
        const { identifier, password } = await request.json();

        if (!identifier || !password) {
            return errorResponse('Email/username dan password wajib diisi', 400);
        }

        const supabase = getSupabase();
        const { data: user, error } = await supabase
            .from('users')
            .select('*, roles(name)')
            .or(`email.eq.${identifier},username.eq.${identifier},nip.eq.${identifier}`)
            .maybeSingle();

        if (error || !user) {
            return errorResponse('Email/username atau password salah', 401);
        }

        if (!user.is_active) {
            return errorResponse('Akun Anda telah dinonaktifkan', 403);
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return errorResponse('Email/username atau password salah', 401);
        }

        const rawRole = user.roles?.name || 'guru';
        const roleName = String(rawRole).toLowerCase();

        const token = jwt.sign(
            { userId: user.id, role: roleName },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return jsonResponse({
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
        return errorResponse('Terjadi kesalahan pada server', 500);
    }
}