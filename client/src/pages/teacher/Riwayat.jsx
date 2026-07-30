import { useState, useEffect } from 'react';
import MobileLayout from '../../components/MobileLayout';
import { attendanceAPI } from '../../utils/api';
import {
    Calendar, Filter, CheckCircle, AlertCircle, XCircle,
    Clock, ChevronRight, Loader, ChevronLeft, MapPin,
    FileText, Award, TrendingUp
} from 'lucide-react';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Riwayat = () => {
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filterStatus, setFilterStatus] = useState('all');

    const filterMonth = format(selectedDate, 'yyyy-MM');

    useEffect(() => {
        fetchAttendance();
    }, [filterMonth]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const response = await attendanceAPI.getHistory();
            let data = response.data.data || [];

            if (filterMonth) {
                data = data.filter(a => a.date && a.date.startsWith(filterMonth));
            }

            setAttendanceList(data);
        } catch (error) {
            console.error('Fetch history error:', error);
            toast.error('Gagal memuat riwayat absensi');
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => {
        setSelectedDate(prev => subMonths(prev, 1));
    };

    const handleNextMonth = () => {
        setSelectedDate(prev => addMonths(prev, 1));
    };

    const filteredList = filterStatus === 'all'
        ? attendanceList
        : filterStatus === 'izin_sakit'
            ? attendanceList.filter(a => a.status === 'izin' || a.status === 'sakit')
            : filterStatus === 'alpha'
                ? attendanceList.filter(a => a.status === 'alpha' || a.status === 'tidak_hadir')
                : attendanceList.filter(a => a.status === filterStatus);

    // Calculate Summary Statistics
    const totalRecords = attendanceList.length;
    const hadirCount = attendanceList.filter(a => a.status === 'hadir').length;
    const terlambatCount = attendanceList.filter(a => a.status === 'terlambat').length;
    const izinSakitCount = attendanceList.filter(a => a.status === 'izin' || a.status === 'sakit').length;
    const alphaCount = attendanceList.filter(a => a.status === 'alpha' || a.status === 'tidak_hadir').length;

    const presenceRate = totalRecords > 0
        ? Math.round(((hadirCount + terlambatCount) / totalRecords) * 100)
        : 100;

    const getStatusTheme = (status) => {
        switch (status) {
            case 'hadir':
                return {
                    label: 'Hadir',
                    bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                    badgeBg: 'bg-emerald-500 text-white',
                    icon: CheckCircle,
                    textColor: 'text-emerald-600',
                    cardBorder: 'border-l-emerald-500'
                };
            case 'terlambat':
                return {
                    label: 'Terlambat',
                    bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                    badgeBg: 'bg-amber-500 text-white',
                    icon: AlertCircle,
                    textColor: 'text-amber-600',
                    cardBorder: 'border-l-amber-500'
                };
            case 'izin':
            case 'sakit':
                return {
                    label: status === 'izin' ? 'Izin' : 'Sakit',
                    bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                    badgeBg: 'bg-blue-500 text-white',
                    icon: FileText,
                    textColor: 'text-blue-600',
                    cardBorder: 'border-l-blue-500'
                };
            case 'tidak_hadir':
            case 'alpha':
            default:
                return {
                    label: 'Alpha',
                    bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
                    badgeBg: 'bg-rose-500 text-white',
                    icon: XCircle,
                    textColor: 'text-rose-600',
                    cardBorder: 'border-l-rose-500'
                };
        }
    };

    return (
        <MobileLayout title="Riwayat Absensi">
            <div className="p-4 space-y-5 pb-24">

                {/* Hero Month Selector & Stats Header */}
                <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 rounded-3xl p-5 text-white shadow-xl border border-slate-800 overflow-hidden">
                    {/* Glowing ambient background blur */}
                    <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Month Navigator Header */}
                    <div className="relative z-10 flex items-center justify-between bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-slate-800/80 mb-5">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                            title="Bulan Sebelumnya"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-amber-400" />
                            <span className="font-bold text-sm text-white tracking-wide">
                                {format(selectedDate, 'MMMM yyyy', { locale: localeId })}
                            </span>
                        </div>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                            title="Bulan Berikutnya"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Attendance Progress & Stats Grid */}
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-400 font-medium">Tingkat Kehadiran Bulan Ini</p>
                                <div className="flex items-baseline gap-2 mt-0.5">
                                    <span className="text-2xl font-black text-white tracking-tight">{presenceRate}%</span>
                                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        {presenceRate >= 90 ? 'Sangat Baik' : presenceRate >= 75 ? 'Baik' : 'Perlu Ditingkatkan'}
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                                <Award className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-900/90 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
                            <div
                                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
                                style={{ width: `${presenceRate}%` }}
                            ></div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-4 gap-2 pt-1">
                            <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-xl p-2.5 text-center">
                                <p className="text-xs text-slate-400 font-medium">Hadir</p>
                                <p className="text-lg font-bold text-emerald-400 mt-0.5">{hadirCount}</p>
                            </div>
                            <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-xl p-2.5 text-center">
                                <p className="text-xs text-slate-400 font-medium">Telat</p>
                                <p className="text-lg font-bold text-amber-400 mt-0.5">{terlambatCount}</p>
                            </div>
                            <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-xl p-2.5 text-center">
                                <p className="text-xs text-slate-400 font-medium">Izin/Sakit</p>
                                <p className="text-lg font-bold text-blue-400 mt-0.5">{izinSakitCount}</p>
                            </div>
                            <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-xl p-2.5 text-center">
                                <p className="text-xs text-slate-400 font-medium">Alpha</p>
                                <p className="text-lg font-bold text-rose-400 mt-0.5">{alphaCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                    {[
                        { key: 'all', label: 'Semua Status', count: attendanceList.length },
                        { key: 'hadir', label: 'Hadir', count: hadirCount },
                        { key: 'terlambat', label: 'Terlambat', count: terlambatCount },
                        { key: 'izin_sakit', label: 'Izin / Sakit', count: izinSakitCount },
                        { key: 'alpha', label: 'Alpha', count: alphaCount }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilterStatus(tab.key)}
                            className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                                filterStatus === tab.key
                                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20 scale-95'
                                    : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                                filterStatus === tab.key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 text-slate-500'
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Attendance List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                            <p className="text-xs text-slate-400 font-medium">Memuat data riwayat...</p>
                        </div>
                    ) : filteredList.length > 0 ? (
                        filteredList.map((record) => {
                            const theme = getStatusTheme(record.status);
                            const StatusIcon = theme.icon;
                            const recordDate = record.date ? parseISO(record.date) : new Date();

                            return (
                                <div
                                    key={record.id}
                                    className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-200/70 relative overflow-hidden border-l-4 ${theme.cardBorder}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        {/* Date Box & Day Name */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 shadow-md">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">
                                                    {format(recordDate, 'MMM', { locale: localeId })}
                                                </span>
                                                <span className="text-base font-extrabold text-white leading-tight">
                                                    {format(recordDate, 'dd')}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                                                    {format(recordDate, 'EEEE', { locale: localeId })}
                                                </h3>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                    {format(recordDate, 'd MMMM yyyy', { locale: localeId })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 shrink-0 ${theme.bg}`}>
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {theme.label}
                                        </span>
                                    </div>

                                    {/* Attendance Time Details */}
                                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-slate-50 rounded-xl p-2 flex items-center gap-2 border border-slate-100">
                                            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                                                <Clock className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Jam Masuk</p>
                                                <p className="font-bold text-slate-800 font-mono text-xs">
                                                    {record.check_in_time ? format(parseISO(record.check_in_time), 'HH:mm') : '-'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-2 flex items-center gap-2 border border-slate-100">
                                            <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                                                <Clock className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Jam Pulang</p>
                                                <p className="font-bold text-slate-800 font-mono text-xs">
                                                    {record.check_out_time ? format(parseISO(record.check_out_time), 'HH:mm') : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location Footer */}
                                    <div className="mt-2.5 flex items-center gap-1 text-[11px] text-slate-400 truncate">
                                        <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                                        <span className="truncate">SMA Al-Hidayah Puspahiang</span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/70 shadow-sm space-y-3">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Tidak Ada Catatan Riwayat</h4>
                                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                                    Belum ada data presensi pada bulan ini atau filter yang dipilih.
                                </p>
                            </div>
                            <button
                                onClick={() => setFilterStatus('all')}
                                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                Reset Filter
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </MobileLayout>
    );
};

export default Riwayat;