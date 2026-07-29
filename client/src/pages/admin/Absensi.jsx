import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { attendanceAPI } from '../../utils/api';
import {
    Calendar, Filter, Search, Eye, MapPin, Clock,
    CheckCircle, XCircle, AlertCircle, Download, Loader, User
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Absensi = () => {
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);

    useEffect(() => {
        fetchAttendance();
    }, [selectedDate, filterStatus]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const params = { date: selectedDate };
            if (filterStatus !== 'all') {
                params.status = filterStatus;
            }

            const response = await attendanceAPI.getAll(params);
            setAttendanceList(response.data.data || []);
        } catch (error) {
            toast.error('Gagal memuat data absensi');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openDetailModal = (attendance) => {
        setSelectedAttendance(attendance);
        setShowDetailModal(true);
    };

    const getStatusBadge = (status) => {
        const st = String(status || '').toLowerCase();
        const styles = {
            hadir: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
            terlambat: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
            tidak_hadir: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
            izin: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
            sakit: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
            alpha: 'bg-slate-800 text-slate-400 border border-slate-700'
        };
        const labels = {
            hadir: 'Hadir',
            terlambat: 'Terlambat',
            tidak_hadir: 'Tidak Hadir',
            izin: 'Izin',
            sakit: 'Sakit',
            alpha: 'Alpha'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[st] || 'bg-slate-800 text-slate-400'}`}>
                {labels[st] || status}
            </span>
        );
    };

    const filteredAttendance = attendanceList.filter((record) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            record.users?.full_name?.toLowerCase().includes(searchLower) ||
            record.users?.nip?.includes(searchTerm)
        );
    });

    // Statistics
    const totalHadir = attendanceList.filter(a => a.status === 'hadir').length;
    const totalTerlambat = attendanceList.filter(a => a.status === 'terlambat').length;
    const totalTidakHadir = attendanceList.filter(a => a.status === 'tidak_hadir').length;

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
                        <h1 className="text-2xl font-bold text-white tracking-tight">Data Absensi Guru</h1>
                        <p className="text-slate-400 text-sm mt-1">Pantau dan kelola kehadiran guru secara realtime</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Absensi</p>
                                <p className="text-2xl font-bold text-white mt-0.5">{attendanceList.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hadir</p>
                                <p className="text-2xl font-bold text-emerald-400 mt-0.5">{totalHadir}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Terlambat</p>
                                <p className="text-2xl font-bold text-amber-400 mt-0.5">{totalTerlambat}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                                <XCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tidak Hadir</p>
                                <p className="text-2xl font-bold text-rose-400 mt-0.5">{totalTidakHadir}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter & Search */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-8 shadow-xl">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                        {/* Search Input */}
                        <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 flex-1">
                            <Search className="w-4 h-4 text-slate-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Cari nama guru atau NIP..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-slate-500"
                            />
                        </div>

                        {/* Date Picker */}
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5">
                            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent text-white text-xs outline-none border-none cursor-pointer"
                            />
                        </div>

                        {/* Filter Status */}
                        <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5">
                            <Filter className="w-4 h-4 text-amber-400 shrink-0" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-slate-900 text-white text-xs outline-none border-none cursor-pointer"
                            >
                                <option value="all" className="bg-slate-900 text-white">Semua Status</option>
                                <option value="hadir" className="bg-slate-900 text-white">Hadir</option>
                                <option value="terlambat" className="bg-slate-900 text-white">Terlambat</option>
                                <option value="tidak_hadir" className="bg-slate-900 text-white">Tidak Hadir</option>
                                <option value="izin" className="bg-slate-900 text-white">Izin</option>
                                <option value="sakit" className="bg-slate-900 text-white">Sakit</option>
                                <option value="alpha" className="bg-slate-900 text-white">Alpha</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-3.5 px-6">Guru</th>
                                    <th className="py-3.5 px-6">Jam Masuk</th>
                                    <th className="py-3.5 px-6">Jam Pulang</th>
                                    <th className="py-3.5 px-6">Status</th>
                                    <th className="py-3.5 px-6">Lokasi</th>
                                    <th className="py-3.5 px-6">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                                {filteredAttendance.length > 0 ? (
                                    filteredAttendance.map((record) => (
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
                                            <td className="py-4 px-6 font-mono text-slate-300">
                                                {record.check_in_time ? format(new Date(record.check_in_time), 'HH:mm:ss') : '-'}
                                            </td>
                                            <td className="py-4 px-6 font-mono text-slate-300">
                                                {record.check_out_time ? format(new Date(record.check_out_time), 'HH:mm:ss') : '-'}
                                            </td>
                                            <td className="py-4 px-6">
                                                {getStatusBadge(record.status)}
                                            </td>
                                            <td className="py-4 px-6 text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                                    <span>SMA Negeri 1</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <button
                                                    onClick={() => openDetailModal(record)}
                                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-500">
                                            {searchTerm || filterStatus !== 'all'
                                                ? 'Tidak ada data absensi yang sesuai dengan filter'
                                                : 'Belum ada data absensi untuk tanggal ini'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail Modal */}
                {showDetailModal && selectedAttendance && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white">Detail Absensi Guru</h2>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 text-xs text-slate-300">
                                {/* Info Guru */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                                    <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                        {selectedAttendance.users?.photo_url ? (
                                            <img src={selectedAttendance.users.photo_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-bold text-white">
                                                {selectedAttendance.users?.full_name?.charAt(0) || '?'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-bold text-white">{selectedAttendance.users?.full_name}</h3>
                                        <p className="text-slate-400">NIP. {selectedAttendance.users?.nip || '-'}</p>
                                        <div className="pt-1">
                                            {getStatusBadge(selectedAttendance.status)}
                                        </div>
                                    </div>
                                </div>

                                {/* Check-in & Check-out Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                                            <Clock className="w-4 h-4 text-emerald-400" />
                                            <span className="font-semibold uppercase tracking-wider text-[11px]">Jam Masuk</span>
                                        </div>
                                        <p className="text-xl font-bold text-white font-mono">
                                            {selectedAttendance.check_in_time
                                                ? format(new Date(selectedAttendance.check_in_time), 'HH:mm:ss')
                                                : '-'}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            {selectedAttendance.check_in_time
                                                ? format(new Date(selectedAttendance.check_in_time), 'EEEE, d MMMM yyyy', { locale: localeId })
                                                : '-'}
                                        </p>
                                    </div>

                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                                            <Clock className="w-4 h-4 text-amber-400" />
                                            <span className="font-semibold uppercase tracking-wider text-[11px]">Jam Pulang</span>
                                        </div>
                                        <p className="text-xl font-bold text-white font-mono">
                                            {selectedAttendance.check_out_time
                                                ? format(new Date(selectedAttendance.check_out_time), 'HH:mm:ss')
                                                : '-'}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            {selectedAttendance.check_out_time
                                                ? format(new Date(selectedAttendance.check_out_time), 'EEEE, d MMMM yyyy', { locale: localeId })
                                                : 'Belum absen pulang'}
                                        </p>
                                    </div>
                                </div>

                                {/* Location Info */}
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-3 text-slate-400">
                                        <MapPin className="w-4 h-4 text-blue-400" />
                                        <span className="font-semibold uppercase tracking-wider text-[11px]">Lokasi Presensi</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-slate-300">
                                        <div>
                                            <p className="text-[11px] text-slate-500">Latitude</p>
                                            <p className="font-mono text-white">{selectedAttendance.check_in_latitude?.toFixed(6) || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-slate-500">Longitude</p>
                                            <p className="font-mono text-white">{selectedAttendance.check_in_longitude?.toFixed(6) || '-'}</p>
                                        </div>
                                    </div>
                                    {selectedAttendance.distance_meters && (
                                        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                                            <span className="text-slate-400 text-[11px]">Jarak dari Sekolah:</span>
                                            <span className="font-bold text-emerald-400">{selectedAttendance.distance_meters} meter</span>
                                        </div>
                                    )}
                                </div>

                                {/* Photo */}
                                {selectedAttendance.check_in_photo_url && (
                                    <div>
                                        <p className="font-semibold text-slate-300 mb-2">Foto Swafoto Check-in</p>
                                        <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-64">
                                            <img
                                                src={selectedAttendance.check_in_photo_url}
                                                alt="Check-in Photo"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-slate-800">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="w-full py-3 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-700 transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Absensi;