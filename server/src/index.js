import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';
import authRoutes from './routes/auth.js';
import attendanceRoutes from './routes/attendance.js';
import userRoutes from './routes/users.js';
import scheduleRoutes from './routes/schedules.js';
import locationRoutes from './routes/locations.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root Endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Absensi Guru API Server is running!' });
});
app.use('/.well-known', (req, res) => {
    res.status(204).end();
});

// Standard Express API Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/locations', locationRoutes);

// Fallback Routes for direct Vercel Serverless Function rewrites
app.use('/auth', authRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/users', userRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/locations', locationRoutes);

// Health Check
app.get(['/api/health', '/health'], async (req, res) => {
    try {
        const { data, error } = await supabase.from('roles').select('name');
        if (error) throw error;

        res.json({
            status: 'ok',
            message: 'Backend berjalan & terhubung ke Supabase!',
            roles: data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal terhubung ke Supabase',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Terjadi kesalahan pada server'
    });
});

// Start standalone HTTP listener if not running inside Vercel serverless environment
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    });
}

export default app;
