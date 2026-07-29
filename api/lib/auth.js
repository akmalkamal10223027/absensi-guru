import jwt from 'jsonwebtoken';
import { getSupabase } from './supabase.js';

export async function authenticate(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { error: 'Token tidak ditemukan', status: 401 };
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const supabase = getSupabase();
        const { data: user, error } = await supabase
            .from('users')
            .select('*, roles(name)')
            .eq('id', decoded.userId)
            .single();

        if (error || !user) {
            return { error: 'User tidak ditemukan', status: 401 };
        }

        if (!user.is_active) {
            return { error: 'Akun telah dinonaktifkan', status: 403 };
        }

        return { user };
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return { error: 'Token tidak valid', status: 401 };
        }
        if (error.name === 'TokenExpiredError') {
            return { error: 'Token telah kedaluwarsa', status: 401 };
        }
        return { error: 'Authentication error', status: 500 };
    }
}

export function authorize(user, ...allowedRoles) {
    const rawRole = user.roles?.name || 'guru';
    const roleName = String(rawRole).toLowerCase();
    return allowedRoles.includes(roleName);
}