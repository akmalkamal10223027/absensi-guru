import { useState, useEffect } from 'react';
import MobileLayout from '../../components/MobileLayout';
import { attendanceAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
    CheckCircle, Clock, Calendar, MapPin, Camera,
    TrendingUp, AlertCircle, XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [hasCheckedIn, setHasCheckedIn] = useState(false);
    const [hasCheckedOut, setHasCheckedOut] = useState(false);
    const [loading, setLoading] = useState(true);
    const [today] = useState(format(new Date(), 'EEEE, d MMMM yyyy', { locale: localeId }));

    useEffect(() => {
        fetchTodayAttendance();
    }, []);

    const fetchTodayAttendance = async () => {
        try {
            const response = await attendanceAPI.getToday();
            setTodayAttendance(response.data.attendance);
            setHasCheckedIn(response.data.hasCheckedIn);
            setHasCheckedOut(response.data.hasCheckedOut);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            hadir: 'bg-green-500',
            terlambat: 'bg-yellow-500',
            tidak_hadir: 'bg-red-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    if (loading) {
        return (
            <MobileLayout title="Dashboard">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout title="Dashboard">
            <div className="p-4 space-y-4">
                {/* Greeting Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-blue-100 text-sm">Selamat datang,</p>
                            <h2 className="text-xl font-bold mt-1">{user?.full_name?.split(',')[0]}</h2>
                            <p className="text-blue-200 text-xs mt-2 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {today}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                            <span className="text-xl font-bold">
                                {user?.full_name?.charAt(0) || '?'}
                            </span>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="bg-white/20 backdrop-blur rounded-xl p-3 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasCheckedIn ? 'bg-green-400' : 'bg-gray-400'
                            }`}>
                            {hasCheckedIn ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">
                                {hasCheckedIn ? 'Sudah Absen Masuk' : 'Belum Absen'}
                            </p>
                            <p className="text-xs text-blue-100">
                                {hasCheckedIn
                                    ? `Jam ${format(new Date(todayAttendance.check_in_time), 'HH:mm')}`
                                    : 'Tap tombol di bawah untuk absen'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => navigate('/teacher/absen-masuk')}
                        disabled={hasCheckedIn}
                        className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${hasCheckedIn
                                ? 'border-green-200 opacity-60'
                                : 'border-blue-200 hover:border-blue-400 active:scale-95'
                            }`}
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 mx-auto">
                            <Camera className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="font-semibold text-gray-900 text-sm text-center">Absen Masuk</p>
                        <p className="text-xs text-gray-500 text-center mt-1">
                            {hasCheckedIn ? 'Sudah done' : 'Tap untuk absen'}
                        </p>
                    </button>

                    <button
                        onClick={() => navigate('/teacher/absen-pulang')}
                        disabled={!hasCheckedIn || hasCheckedOut}
                        className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${!hasCheckedIn || hasCheckedOut
                                ? 'border-gray-200 opacity-60'
                                : 'border-green-200 hover:border-green-400 active:scale-95'
                            }`}
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 mx-auto">
                            <Clock className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="font-semibold text-gray-900 text-sm text-center">Absen Pulang</p>
                        <p className="text-xs text-gray-500 text-center mt-1">
                            {hasCheckedOut ? 'Sudah done' : !hasCheckedIn ? 'Absen dulu' : 'Tap untuk pulang'}
                        </p>
                    </button>
                </div>

                {/* Today's Info */}
                {hasCheckedIn && todayAttendance && (
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            Informasi Hari Ini
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    Jam Masuk
                                </div>
                                <span className="font-semibold text-gray-900">
                                    {format(new Date(todayAttendance.check_in_time), 'HH:mm:ss')}
                                </span>
                            </div>
                            {todayAttendance.check_out_time && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        Jam Pulang
                                    </div>
                                    <span className="font-semibold text-gray-900">
                                        {format(new Date(todayAttendance.check_out_time), 'HH:mm:ss')}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    Status
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(todayAttendance.status)
                                    }`}>
                                    {todayAttendance.status === 'hadir' ? 'Hadir' :
                                        todayAttendance.status === 'terlambat' ? 'Terlambat' : 'Tidak Hadir'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent History Preview */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <History className="w-4 h-4 text-blue-600" />
                            Riwayat Terbaru
                        </h3>
                        <button
                            onClick={() => navigate('/teacher/riwayat')}
                            className="text-xs text-blue-600 font-medium"
                        >
                            Lihat Semua
                        </button>
                    </div>
                    {todayAttendance ? (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${todayAttendance.status === 'hadir' ? 'bg-green-100' :
                                    todayAttendance.status === 'terlambat' ? 'bg-yellow-100' : 'bg-red-100'
                                }`}>
                                {todayAttendance.status === 'hadir' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                                    todayAttendance.status === 'terlambat' ? <AlertCircle className="w-5 h-5 text-yellow-600" /> :
                                        <XCircle className="w-5 h-5 text-red-600" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Hari Ini</p>
                                <p className="text-xs text-gray-500">
                                    {format(new Date(todayAttendance.check_in_time), 'HH:mm')} - {
                                        todayAttendance.check_out_time
                                            ? format(new Date(todayAttendance.check_out_time), 'HH:mm')
                                            : 'Belum pulang'
                                    }
                                </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${todayAttendance.status === 'hadir' ? 'bg-green-100 text-green-700' :
                                    todayAttendance.status === 'terlambat' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {todayAttendance.status === 'hadir' ? 'Hadir' :
                                    todayAttendance.status === 'terlambat' ? 'Terlambat' : 'Tidak Hadir'}
                            </span>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-400">
                            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Belum ada absensi hari ini</p>
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
                        <p className="text-2xl font-bold text-green-600">24</p>
                        <p className="text-xs text-gray-500 mt-1">Hadir</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
                        <p className="text-2xl font-bold text-yellow-600">2</p>
                        <p className="text-xs text-gray-500 mt-1">Terlambat</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
                        <p className="text-2xl font-bold text-red-600">1</p>
                        <p className="text-xs text-gray-500 mt-1">Alpha</p>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
};

// Icon helper
const History = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default TeacherDashboard;