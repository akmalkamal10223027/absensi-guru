import { useState, useEffect } from 'react';
import MobileLayout from '../../components/MobileLayout';
import { attendanceAPI } from '../../utils/api';
import {
    Calendar, Filter, CheckCircle, AlertCircle, XCircle,
    Clock, ChevronRight, Loader
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Riwayat = () => {
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchAttendance();
    }, [filterMonth, filterStatus]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const response = await attendanceAPI.getHistory();
            let data = response.data.data || [];

            if (filterMonth) {
                data = data.filter(a => a.date && a.date.startsWith(filterMonth));
            }
            if (filterStatus !== 'all') {
                data = data.filter(a => a.status === filterStatus);
            }

            setAttendanceList(data);
        } catch (error) {
            console.error('Fetch history error:', error);
            toast.error('Gagal memuat riwayat');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            hadir: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
            terlambat: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
            tidak_hadir: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
            izin: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
            sakit: { icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
            alpha: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100' }
        };
        return icons[status] || icons.alpha;
    };

    const getStatusLabel = (status) => {
        const labels = {
            hadir: 'Hadir',
            terlambat: 'Terlambat',
            tidak_hadir: 'Tidak Hadir',
            izin: 'Izin',
            sakit: 'Sakit',
            alpha: 'Alpha'
        };
        return labels[status] || status;
    };

    return (
        <MobileLayout title="Riwayat Absensi">
            <div className="p-4 space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">
                            {attendanceList.filter(a => a.status === 'hadir').length}
                        </p>
                        <p className="text-xs text-green-700 mt-1">Hadir</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                            {attendanceList.filter(a => a.status === 'terlambat').length}
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">Terlambat</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-red-600">
                            {attendanceList.filter(a => a.status === 'alpha' || a.status === 'tidak_hadir').length}
                        </p>
                        <p className="text-xs text-red-700 mt-1">Alpha</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <input
                            type="month"
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                        >
                            <option value="all">Semua Status</option>
                            <option value="hadir">Hadir</option>
                            <option value="terlambat">Terlambat</option>
                            <option value="izin">Izin</option>
                            <option value="sakit">Sakit</option>
                            <option value="alpha">Alpha</option>
                        </select>
                    </div>
                </div>

                {/* Attendance List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    ) : attendanceList.length > 0 ? (
                        attendanceList.map((record) => {
                            const statusInfo = getStatusIcon(record.status);
                            const StatusIcon = statusInfo.icon;
                            const recordDate = record.date ? new Date(record.date) : new Date();

                            return (
                                <div
                                    key={record.id}
                                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${statusInfo.bg}`}>
                                        <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-semibold text-gray-900 text-sm">
                                                {format(recordDate, 'EEEE', { locale: localeId })}
                                            </p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                                                {getStatusLabel(record.status)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">
                                            {format(recordDate, 'd MMMM yyyy', { locale: localeId })}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {record.check_in_time ? format(new Date(record.check_in_time), 'HH:mm') : '-'}
                                            </span>
                                            <span className="text-gray-300">|</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {record.check_out_time ? format(new Date(record.check_out_time), 'HH:mm') : '-'}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                            <p className="text-gray-500 font-medium">Tidak ada data riwayat</p>
                            <p className="text-sm text-gray-400 mt-1">Coba sesuaikan filter periode tanggal</p>
                        </div>
                    )}
                </div>
            </div>
        </MobileLayout>
    );
};

export default Riwayat;