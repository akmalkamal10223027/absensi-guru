import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { attendanceAPI } from '../../utils/api';
import { Users, CheckCircle, Clock, XCircle, Calendar, TrendingUp } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [dailyStats, setDailyStats] = useState([]);
    const [recentAttendance, setRecentAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [today] = useState(format(new Date(), 'EEEE, d MMMM yyyy', { locale: localeId }));

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, recentRes] = await Promise.allSettled([
                attendanceAPI.getDashboardStats(),
                attendanceAPI.getRecent()
            ]);

            if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
                setStats(statsRes.value.data.stats || {});
                setDailyStats(statsRes.value.data.dailyStats || []);
            }
            if (recentRes.status === 'fulfilled' && recentRes.value?.data) {
                setRecentAttendance(recentRes.value.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            hadir: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
            terlambat: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
            tidak_hadir: 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        };
        const labels = {
            hadir: 'Hadir',
            terlambat: 'Terlambat',
            tidak_hadir: 'Tidak Hadir'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-slate-800 text-slate-400'}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-900 text-white">
                <AdminSidebar />
                <div className="flex-1 ml-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-900 font-sans text-slate-100">
            <AdminSidebar />
            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Admin</h1>
                        <p className="text-slate-400 text-sm mt-1">Selamat datang kembali, Admin!</p>
                    </div>
                    <div className="flex items-center gap-2.5 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl shadow-lg">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-medium text-slate-300">{today}</span>
                    </div>
                </div>

                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {/* Total Guru */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Guru</span>
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">{stats?.totalGuru || 0}</span>
                            <span className="text-xs text-slate-400">Orang</span>
                        </div>
                    </div>

                    {/* Hadir */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hadir Hari Ini</span>
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline justify-between mb-2">
                            <span className="text-2xl font-bold text-emerald-400">{stats?.hadir || 0}</span>
                            <span className="text-xs font-semibold text-emerald-400">{stats?.hadirPercentage || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="h-1.5 rounded-full bg-emerald-500"
                                style={{ width: `${stats?.hadirPercentage || 0}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Terlambat */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Terlambat</span>
                            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline justify-between mb-2">
                            <span className="text-2xl font-bold text-amber-400">{stats?.terlambat || 0}</span>
                            <span className="text-xs font-semibold text-amber-400">{stats?.terlambatPercentage || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="h-1.5 rounded-full bg-amber-500"
                                style={{ width: `${stats?.terlambatPercentage || 0}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Tidak Hadir */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tidak Hadir</span>
                            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                                <XCircle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline justify-between mb-2">
                            <span className="text-2xl font-bold text-rose-400">{stats?.tidakHadir || 0}</span>
                            <span className="text-xs font-semibold text-rose-400">{stats?.tidakHadirPercentage || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="h-1.5 rounded-full bg-rose-500"
                                style={{ width: `${stats?.tidakHadirPercentage || 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Line Chart */}
                    <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-base font-bold text-white mb-4">
                            Grafik Kehadiran (30 Hari Terakhir)
                        </h3>
                        {dailyStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={dailyStats}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => format(new Date(value), 'd MMM', { locale: localeId })}
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                                        labelFormatter={(value) => format(new Date(value), 'd MMMM yyyy', { locale: localeId })}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="hadir"
                                        stroke="#3b82f6"
                                        strokeWidth={2.5}
                                        dot={{ r: 4, fill: '#3b82f6' }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-60 flex items-center justify-center text-slate-500 text-xs">
                                Belum ada data tren kehadiran
                            </div>
                        )}
                    </div>

                    {/* Donut Chart Summary */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                        <h3 className="text-base font-bold text-white mb-4">Kehadiran Hari Ini</h3>
                        <div className="flex items-center justify-center my-2">
                            <div className="relative w-36 h-36">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="12" />
                                    <circle
                                        cx="50" cy="50" r="40" fill="none"
                                        stroke="#10b981" strokeWidth="12"
                                        strokeDasharray={`${(stats?.hadirPercentage || 0) * 2.51} 251`}
                                        strokeLinecap="round"
                                    />
                                    <circle
                                        cx="50" cy="50" r="40" fill="none"
                                        stroke="#f59e0b" strokeWidth="12"
                                        strokeDasharray={`${(stats?.terlambatPercentage || 0) * 2.51} 251`}
                                        strokeDashoffset={`-${(stats?.hadirPercentage || 0) * 2.51}`}
                                        strokeLinecap="round"
                                    />
                                    <circle
                                        cx="50" cy="50" r="40" fill="none"
                                        stroke="#ef4444" strokeWidth="12"
                                        strokeDasharray={`${(stats?.tidakHadirPercentage || 0) * 2.51} 251`}
                                        strokeDashoffset={`-${((stats?.hadirPercentage || 0) + (stats?.terlambatPercentage || 0)) * 2.51}`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-white">{stats?.hadirPercentage || 0}%</span>
                                    <span className="text-[11px] text-slate-400">Hadir</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-slate-400">Hadir</span>
                                </div>
                                <span className="font-semibold text-white">{stats?.hadir || 0} ({stats?.hadirPercentage || 0}%)</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                    <span className="text-slate-400">Terlambat</span>
                                </div>
                                <span className="font-semibold text-white">{stats?.terlambat || 0} ({stats?.terlambatPercentage || 0}%)</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                                    <span className="text-slate-400">Tidak Hadir</span>
                                </div>
                                <span className="font-semibold text-white">{stats?.tidakHadir || 0} ({stats?.tidakHadirPercentage || 0}%)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Attendance Table */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800/80">
                        <h3 className="text-base font-bold text-white">Absensi Terbaru Hari Ini</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-3.5 px-6">Guru</th>
                                    <th className="py-3.5 px-6">Jam Masuk</th>
                                    <th className="py-3.5 px-6">Status</th>
                                    <th className="py-3.5 px-6">Lokasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                                {recentAttendance.length > 0 ? (
                                    recentAttendance.map((record) => (
                                        <tr key={record.id} className="hover:bg-slate-900/40 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                                        {record.users?.photo_url ? (
                                                            <img src={record.users.photo_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs font-semibold text-white">
                                                                {record.users?.full_name?.charAt(0) || '?'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white text-sm">{record.users?.full_name}</p>
                                                        <p className="text-slate-500 text-[11px]">NIP. {record.users?.nip || '-'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-slate-300 font-mono">
                                                {record.check_in_time ? format(new Date(record.check_in_time), 'HH:mm:ss') : '-'}
                                            </td>
                                            <td className="py-4 px-6">
                                                {getStatusBadge(record.status)}
                                            </td>
                                            <td className="py-4 px-6 text-slate-400">SMA Negeri 1</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-slate-500">
                                            Belum ada data absensi hari ini
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;