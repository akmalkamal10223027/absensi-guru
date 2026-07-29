import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token tidak ditemukan' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { data: user, error } = await supabase
            .from('users')
            .select('*, roles(name)')
            .eq('id', decoded.userId)
            .single();

        if (error) {
            console.error('Auth middleware error:', error);
        }

        if (!user) {
            return res.status(401).json({ error: 'User tidak ditemukan' });
        }

        if (user.is_active === false) {
            return res.status(403).json({ error: 'Akun telah dinonaktifkan' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token tidak valid' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token telah kedaluwarsa' });
        }
        next(error);
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        const rawRole = req.user.roles?.name || (Array.isArray(req.user.roles) ? req.user.roles[0]?.name : req.user.role) || '';
        const userRole = String(rawRole).toLowerCase();
        const allowedRoles = roles.map(r => r.toLowerCase());

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'Akses ditolak' });
        }
        next();
    };
};