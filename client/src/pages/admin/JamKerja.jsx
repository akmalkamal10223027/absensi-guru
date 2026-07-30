import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { scheduleAPI } from '../../utils/api';
import {
    Clock, Edit2, Save, X, CheckCircle, AlertCircle,
    Loader, Calendar, Timer
} from 'lucide-react';
import toast from 'react-hot-toast';

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const JamKerja = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        day_of_week: 0,
        start_time: '07:00',
        end_time: '16:00',
        late_threshold_minutes: 15,
        is_active: true
    });

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const response = await scheduleAPI.getAll();
            const data = response.data.data || [];

            // Buat array 7 hari, isi dengan data dari server atau default
            const allDays = [];
            for (let i = 0; i < 7; i++) {
                const existing = data.find(s => s.day_of_week === i);
                allDays.push(existing || {
                    id: null,
                    day_of_week: i,
                    start_time: i === 0 || i === 6 ? '00:00' : '07:00',
                    end_time: i === 0 || i === 6 ? '00:00' : '16:00',
                    late_threshold_minutes: 15,
                    is_active: i !== 0 && i !== 6 // Weekend nonaktif default
                });
            }

            setSchedules(allDays);
        } catch (error) {
            toast.error('Gagal memuat data jam kerja');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (schedule) => {
        setEditingId(schedule.id ?? schedule.day_of_week);
        setFormData({
            day_of_week: schedule.day_of_week,
            start_time: schedule.start_time?.substring(0, 5) || '07:00',
            end_time: schedule.end_time?.substring(0, 5) || '16:00',
            late_threshold_minutes: schedule.late_threshold_minutes || 15,
            is_active: schedule.is_active
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({
            day_of_week: 0,
            start_time: '07:00',
            end_time: '16:00',
            late_threshold_minutes: 15,
            is_active: true
        });
    };

    const handleSave = async (schedule) => {
        setSaving(true);
        try {
            const payload = {
                day_of_week: formData.day_of_week,
                start_time: formData.start_time + ':00',
                end_time: formData.end_time + ':00',
                late_threshold_minutes: parseInt(formData.late_threshold_minutes),
                is_active: formData.is_active
            };

            if (schedule.id) {
                // Update existing
                await scheduleAPI.update(schedule.id, payload);
                toast.success(`Jadwal ${dayNames[schedule.day_of_week]} berhasil diperbarui`);
            } else {
                // Create new
                await scheduleAPI.create(payload);
                toast.success(`Jadwal ${dayNames[schedule.day_of_week]} berhasil ditambahkan`);
            }

            setEditingId(null);
            fetchSchedules();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal menyimpan jadwal');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const formatTime = (time) => {
        if (!time) return '-';
        return time.substring(0, 5);
    };

    const calculateWorkHours = (startTime, endTime) => {
        if (!startTime || !endTime) return 0;
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        const diff = endMinutes - startMinutes;
        return diff > 0 ? (diff / 60).toFixed(1) : 0;
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-900 text-white">
                <AdminSidebar />
                <div className="flex-1 lg:ml-64 flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-900 font-sans text-slate-100 overflow-x-hidden">
            <AdminSidebar />
            <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 w-full max-w-full overflow-x-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Pengaturan Jam Kerja</h1>
                        <p className="text-slate-400 text-sm mt-1">Kelola jam kerja harian dan batas toleransi keterlambatan presensi</p>
                    </div>
                </div>

                {/* Banner Info */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-8 shadow-xl">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-base">Panduan Pengaturan Jadwal Presensi</h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Atur jam masuk dan jam pulang kerja untuk setiap hari dalam seminggu. Toleransi keterlambatan menentukan batas menit setelah jam masuk di mana guru dinyatakan terlambat. Hari yang dinonaktifkan akan otomatis dianggap sebagai hari libur sekolah.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hari Kerja Aktif</p>
                                <p className="text-2xl font-bold text-white mt-0.5">
                                    {schedules.filter(s => s.is_active).length} <span className="text-xs font-normal text-slate-400">Hari</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                                <Timer className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Jam Kerja/Minggu</p>
                                <p className="text-2xl font-bold text-white mt-0.5">
                                    {schedules
                                        .filter(s => s.is_active)
                                        .reduce((sum, s) => sum + parseFloat(calculateWorkHours(s.start_time, s.end_time)), 0)
                                        .toFixed(1)} <span className="text-xs font-normal text-slate-400">Jam</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hari Libur</p>
                                <p className="text-2xl font-bold text-white mt-0.5">
                                    {schedules.filter(s => !s.is_active).length} <span className="text-xs font-normal text-slate-400">Hari</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Schedule List Cards */}
                <div className="space-y-4">
                    {schedules.map((schedule) => {
                        const currentId = schedule.id ?? schedule.day_of_week;
                        const isEditing = editingId === currentId;
                        const isWeekend = schedule.day_of_week === 0 || schedule.day_of_week === 6;
                        const workHours = calculateWorkHours(schedule.start_time, schedule.end_time);

                        return (
                            <div
                                key={schedule.day_of_week}
                                className={`bg-slate-950/80 border rounded-2xl p-5 shadow-lg transition-all ${schedule.is_active
                                        ? 'border-slate-800'
                                        : 'border-slate-800/60 opacity-60'
                                    }`}
                            >
                                {!isEditing ? (
                                    // View Mode
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shrink-0 ${schedule.is_active ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-800 text-slate-500'
                                                }`}>
                                                <Calendar className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2.5">
                                                    <h3 className="text-base font-bold text-white">
                                                        {dayNames[schedule.day_of_week]}
                                                    </h3>
                                                    {isWeekend && (
                                                        <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-semibold rounded-full">
                                                            Akhir Pekan
                                                        </span>
                                                    )}
                                                    {!schedule.is_active ? (
                                                        <span className="px-2.5 py-0.5 bg-slate-800 text-slate-400 text-[11px] font-semibold rounded-full">
                                                            Libur
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold rounded-full">
                                                            Hari Kerja
                                                        </span>
                                                    )}
                                                </div>
                                                {schedule.is_active ? (
                                                    <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-slate-400">
                                                        <div className="flex items-center gap-1.5 font-mono text-slate-200">
                                                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                                                            <span>{formatTime(schedule.start_time)}</span>
                                                            <span>—</span>
                                                            <span>{formatTime(schedule.end_time)}</span>
                                                        </div>
                                                        <span className="text-slate-500">({workHours} Jam Kerja)</span>
                                                        <div className="flex items-center gap-1 text-amber-400 font-medium">
                                                            <AlertCircle className="w-3.5 h-3.5" />
                                                            <span>Toleransi: {schedule.late_threshold_minutes} Menit</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-500 mt-1">Hari libur — tidak ada jadwal presensi</p>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleEdit(schedule)}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 rounded-xl font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            <span>Edit Jam</span>
                                        </button>
                                    </div>
                                ) : (
                                    // Edit Mode Form
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                            <h3 className="text-base font-bold text-white">
                                                Edit Jam Kerja — {dayNames[schedule.day_of_week]}
                                            </h3>
                                            <button
                                                onClick={handleCancel}
                                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {/* Jam Masuk */}
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                    Jam Masuk
                                                </label>
                                                <input
                                                    type="time"
                                                    name="start_time"
                                                    value={formData.start_time}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                                                />
                                            </div>

                                            {/* Jam Pulang */}
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                    Jam Pulang
                                                </label>
                                                <input
                                                    type="time"
                                                    name="end_time"
                                                    value={formData.end_time}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                                                />
                                            </div>

                                            {/* Toleransi */}
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                    Toleransi (Menit)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="late_threshold_minutes"
                                                    value={formData.late_threshold_minutes}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    max="60"
                                                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 font-mono"
                                                />
                                            </div>

                                            {/* Status */}
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                    Status Hari
                                                </label>
                                                <label className="flex items-center gap-3 py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="is_active"
                                                        checked={formData.is_active}
                                                        onChange={handleInputChange}
                                                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
                                                    />
                                                    <span className="text-xs font-semibold text-white">
                                                        {formData.is_active ? 'Hari Kerja Aktif' : 'Hari Libur'}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={handleCancel}
                                                className="px-5 py-2 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-700 transition-colors"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                onClick={() => handleSave(schedule)}
                                                disabled={saving}
                                                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
                                            >
                                                {saving ? (
                                                    <>
                                                        <Loader className="w-4 h-4 animate-spin" />
                                                        <span>Menyimpan...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4" />
                                                        <span>Simpan Perubahan</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default JamKerja;