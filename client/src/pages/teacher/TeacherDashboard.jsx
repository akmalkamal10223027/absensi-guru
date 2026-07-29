import { useState, useEffect } from 'react';
import MobileLayout from '../../components/MobileLayout';
import { attendanceAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
    CheckCircle, Clock, Calendar, MapPin, Camera,
    TrendingUp, AlertCircle, XCircle, ChevronRight, UserCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

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
            console.error('Error fetching today attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 11) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    };

    const getStatusColor = (status) => {
        const colors = {
            hadir: 'bg-emerald-500 text-white',
            terlambat: 'bg-amber-500 text-white',
            tidak_hadir: 'bg-rose-500 text-white'
        };
        return colors[status] || 'bg-slate-500 text-white';
    };

    if (loading) {
        return (
            <MobileLayout title="Dashboard Guru">
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <p className="text-xs text-gray-500 font-medium">Memuat data presensi...</p>
                </div>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout title="Dashboard Guru">
            <div className="p-4 space-y-4">
                {/* Greeting Card with School Logo */}
                <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-950 rounded-2xl p-5 text-white shadow-xl shadow-blue-950/20 overflow-hidden border border-slate-800">
                    {/* Background Subtle Shapes */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="relative z-10 flex items-start justify-between mb-4">
                        <div className="flex-1 pr-3">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-semibold tracking-wide mb-1">
                                {getGreeting()} 👋
                            </span>
                            <h2 className="text-lg font-bold text-white tracking-tight leading-snug line-clamp-1">
                                {user?.full_name || 'Bapak/Ibu Guru'}
                            </h2>
                            <p className="text-slate-300 text-xs mt-1 flex items-center gap-1.5 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                {today}
                            </p>
                        </div>
                        {/* Official School Logo */}
                        <div className="w-13 h-13 rounded-2xl bg-white/10 p-1.5 backdrop-blur border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                            <img src={logoImg} alt="Logo SMA Negeri 1" className="w-full h-full object-contain" />
                        </div>
                    </div>

                    {/* Status Badge inside Card */}
                    <div className="relative z-10 bg-slate-800/80 backdrop-blur rounded-xl p-3.5 border border-slate-700/60 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                            hasCheckedIn ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>
                            {hasCheckedIn ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm text-white">
                                    {hasCheckedIn ? 'Sudah Presensi Masuk' : 'Belum Presensi'}
                                </p>
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5 truncate">
                                {hasCheckedIn
                                    ? `Jam: ${format(new Date(todayAttendance.check_in_time), 'HH:mm:ss')} WIB`
                                    : 'Silakan absen masuk menggunakan kamera & GPS'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => navigate('/teacher/absen-masuk')}
                        disabled={hasCheckedIn}
                        className={`relative group rounded-2xl p-4 text-left transition-all duration-200 border-2 ${
                            hasCheckedIn
                                ? 'bg-slate-50 border-slate-200 opacity-65 cursor-not-allowed'
                                : 'bg-white border-blue-500/30 hover:border-blue-500 shadow-sm hover:shadow-md active:scale-98'
                        }`}
                    >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
                            hasCheckedIn ? 'bg-slate-200 text-slate-500' : 'bg-blue-50 text-blue-600'
                        }`}>
                            <Camera className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-gray-900 text-sm">Absen Masuk</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                            {hasCheckedIn ? '✓ Sudah Absen' : 'Ambil Swafoto & GPS'}
                        </p>
                    </button>

                    <button
                        onClick={() => navigate('/teacher/absen-pulang')}
                        disabled={!hasCheckedIn || hasCheckedOut}
                        className={`relative group rounded-2xl p-4 text-left transition-all duration-200 border-2 ${
                            !hasCheckedIn || hasCheckedOut
                                ? 'bg-slate-50 border-slate-200 opacity-65 cursor-not-allowed'
                                : 'bg-white border-emerald-500/30 hover:border-emerald-500 shadow-sm hover:shadow-md active:scale-98'
                        }`}
                    >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
                            hasCheckedOut ? 'bg-slate-200 text-slate-500' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-gray-900 text-sm">Absen Pulang</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                            {hasCheckedOut ? '✓ Sudah Pulang' : !hasCheckedIn ? 'Absen Masuk Dulu' : 'Presensi Pulang'}
                        </p>
                    </button>
                </div>

                {/* Today's Presensi Summary Detail */}
                {hasCheckedIn && todayAttendance && (
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-600" />
                                Details Presensi Hari Ini
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(todayAttendance.status)}`}>
                                {todayAttendance.status === 'hadir' ? 'Hadir Tepat Waktu' :
                                    todayAttendance.status === 'terlambat' ? 'Terlambat' : 'Tidak Hadir'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                <p className="text-gray-500 mb-1 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Jam Masuk
                                </p>
                                <p className="font-bold text-gray-900 text-sm">
                                    {format(new Date(todayAttendance.check_in_time), 'HH:mm:ss')} WIB
                                </p>
                            </div>

                            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                <p className="text-gray-500 mb-1 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-emerald-600" /> Jam Pulang
                                </p>
                                <p className="font-bold text-gray-900 text-sm">
                                    {todayAttendance.check_out_time
                                        ? `${format(new Date(todayAttendance.check_out_time), 'HH:mm:ss')} WIB`
                                        : '-'}
                                </p>
                            </div>
                        </div>

                        {todayAttendance.distance_meters !== undefined && (
                            <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
                                <span className="flex items-center gap-1 text-gray-500">
                                    <MapPin className="w-3.5 h-3.5 text-red-500" /> Jarak dari Sekolah
                                </span>
                                <span className="font-semibold text-gray-800">{todayAttendance.distance_meters} Meter</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Recent History Preview */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            Riwayat Terbaru
                        </h3>
                        <button
                            onClick={() => navigate('/teacher/riwayat')}
                            className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-0.5"
                        >
                            Lihat Semua <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    {todayAttendance ? (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                todayAttendance.status === 'hadir' ? 'bg-emerald-100 text-emerald-600' :
                                todayAttendance.status === 'terlambat' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                            }`}>
                                {todayAttendance.status === 'hadir' ? <CheckCircle className="w-5 h-5" /> :
                                    todayAttendance.status === 'terlambat' ? <AlertCircle className="w-5 h-5" /> :
                                        <XCircle className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">Presensi Hari Ini</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {format(new Date(todayAttendance.check_in_time), 'HH:mm')} - {
                                        todayAttendance.check_out_time
                                            ? format(new Date(todayAttendance.check_out_time), 'HH:mm')
                                            : 'Belum Pulang'
                                    }
                                </p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                todayAttendance.status === 'hadir' ? 'bg-emerald-100 text-emerald-700' :
                                todayAttendance.status === 'terlambat' ? 'bg-amber-100 text-amber-700' :
                                'bg-rose-100 text-rose-700'
                            }`}>
                                {todayAttendance.status === 'hadir' ? 'Hadir' :
                                    todayAttendance.status === 'terlambat' ? 'Terlambat' : 'Alpha'}
                            </span>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <Calendar className="w-10 h-10 mx-auto mb-1 text-gray-300" />
                            <p className="text-xs font-medium text-gray-500">Belum ada catatan presensi hari ini</p>
                        </div>
                    )}
                </div>
            </div>
        </MobileLayout>
    );
};

export default TeacherDashboard;