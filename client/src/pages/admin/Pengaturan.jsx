import { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import {
    Settings, Building2, Bell, Shield, Database, Save,
    CheckCircle, AlertCircle, Info, Mail, Clock, Lock,
    Server, HardDrive, Globe, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

const Pengaturan = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [saving, setSaving] = useState(false);

    // Form states
    const [generalSettings, setGeneralSettings] = useState({
        school_name: 'SMA Negeri 1',
        school_address: 'Jl. Pendidikan No. 1, Jakarta',
        school_phone: '021-1234567',
        school_email: 'info@sman1.sch.id',
        academic_year: '2026/2027',
        timezone: 'Asia/Jakarta'
    });

    const [attendanceSettings, setAttendanceSettings] = useState({
        default_radius: 100,
        default_late_threshold: 15,
        allow_selfie: true,
        require_gps: true,
        auto_checkout_time: '17:00',
        enable_weekend: false
    });

    const [notificationSettings, setNotificationSettings] = useState({
        email_reminder: true,
        daily_report: true,
        weekly_report: true,
        monthly_report: true,
        reminder_time: '06:00',
        report_email: 'admin@sman1.sch.id'
    });

    const [securitySettings, setSecuritySettings] = useState({
        password_min_length: 8,
        password_require_uppercase: true,
        password_require_number: true,
        password_require_special: false,
        session_timeout: 60,
        max_login_attempts: 5,
        enable_2fa: false
    });

    const handleGeneralChange = (e) => {
        setGeneralSettings({
            ...generalSettings,
            [e.target.name]: e.target.value
        });
    };

    const handleAttendanceChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAttendanceSettings({
            ...attendanceSettings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleNotificationChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNotificationSettings({
            ...notificationSettings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSecurityChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSecuritySettings({
            ...securitySettings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSave = async (section) => {
        setSaving(true);
        setTimeout(() => {
            toast.success(`Pengaturan ${section} berhasil disimpan`);
            setSaving(false);
        }, 800);
    };

    const tabs = [
        { id: 'general', label: 'Umum', icon: Building2 },
        { id: 'attendance', label: 'Absensi', icon: Clock },
        { id: 'notification', label: 'Notifikasi', icon: Bell },
        { id: 'security', label: 'Keamanan', icon: Shield },
        { id: 'system', label: 'Sistem', icon: Server }
    ];

    return (
        <div className="flex min-h-screen bg-slate-900 font-sans text-slate-100">
            <AdminSidebar />
            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Pengaturan Sistem</h1>
                        <p className="text-slate-400 text-sm mt-1">Konfigurasi parameter aplikasi, notifikasi, dan keamanan absensi</p>
                    </div>
                </div>

                {/* Main Card with Tabs */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-8">
                    {/* Navigation Tabs */}
                    <div className="border-b border-slate-800/80 bg-slate-900/60">
                        <nav className="flex overflow-x-auto p-2 gap-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${isActive
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-white mb-4">Informasi Sekolah & Identitas</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Nama Sekolah
                                            </label>
                                            <input
                                                type="text"
                                                name="school_name"
                                                value={generalSettings.school_name}
                                                onChange={handleGeneralChange}
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Tahun Ajaran Aktif
                                            </label>
                                            <input
                                                type="text"
                                                name="academic_year"
                                                value={generalSettings.academic_year}
                                                onChange={handleGeneralChange}
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Alamat Sekolah
                                            </label>
                                            <input
                                                type="text"
                                                name="school_address"
                                                value={generalSettings.school_address}
                                                onChange={handleGeneralChange}
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Telepon Sekolah
                                            </label>
                                            <input
                                                type="text"
                                                name="school_phone"
                                                value={generalSettings.school_phone}
                                                onChange={handleGeneralChange}
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Email Official
                                            </label>
                                            <input
                                                type="email"
                                                name="school_email"
                                                value={generalSettings.school_email}
                                                onChange={handleGeneralChange}
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Zona Waktu (Timezone)
                                            </label>
                                            <select
                                                name="timezone"
                                                value={generalSettings.timezone}
                                                onChange={handleGeneralChange}
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 cursor-pointer"
                                            >
                                                <option value="Asia/Jakarta" className="bg-slate-900 text-white">WIB (Asia/Jakarta)</option>
                                                <option value="Asia/Makassar" className="bg-slate-900 text-white">WITA (Asia/Makassar)</option>
                                                <option value="Asia/Jayapura" className="bg-slate-900 text-white">WIT (Asia/Jayapura)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-800">
                                    <button
                                        onClick={() => handleSave('Umum')}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
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

                        {/* Attendance Settings */}
                        {activeTab === 'attendance' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-white mb-4">Pengaturan Parameter Absensi</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Radius Default (Meter)
                                            </label>
                                            <input
                                                type="number"
                                                name="default_radius"
                                                value={attendanceSettings.default_radius}
                                                onChange={handleAttendanceChange}
                                                min="10"
                                                max="1000"
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono"
                                            />
                                            <p className="text-[11px] text-slate-500 mt-1">Radius presensi GPS sekolah</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Toleransi Terlambat (Menit)
                                            </label>
                                            <input
                                                type="number"
                                                name="default_late_threshold"
                                                value={attendanceSettings.default_late_threshold}
                                                onChange={handleAttendanceChange}
                                                min="0"
                                                max="60"
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono"
                                            />
                                            <p className="text-[11px] text-slate-500 mt-1">Batas menit sebelum keterlambatan</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Waktu Auto Check-Out
                                            </label>
                                            <input
                                                type="time"
                                                name="auto_checkout_time"
                                                value={attendanceSettings.auto_checkout_time}
                                                onChange={handleAttendanceChange}
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500"
                                            />
                                            <p className="text-[11px] text-slate-500 mt-1">Auto checkout jika guru tidak absen pulang</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <label className="flex items-center gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="allow_selfie"
                                                checked={attendanceSettings.allow_selfie}
                                                onChange={handleAttendanceChange}
                                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
                                            />
                                            <div>
                                                <p className="text-xs font-semibold text-white">Wajib Foto Swafoto (Selfie)</p>
                                                <p className="text-[11px] text-slate-400">Guru harus mengambil foto wajah saat check-in & check-out</p>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="require_gps"
                                                checked={attendanceSettings.require_gps}
                                                onChange={handleAttendanceChange}
                                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
                                            />
                                            <div>
                                                <p className="text-xs font-semibold text-white">Wajib GPS Geolocation</p>
                                                <p className="text-[11px] text-slate-400">Presensi hanya diterima jika posisi GPS berhasil divalidasi</p>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="enable_weekend"
                                                checked={attendanceSettings.enable_weekend}
                                                onChange={handleAttendanceChange}
                                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
                                            />
                                            <div>
                                                <p className="text-xs font-semibold text-white">Aktifkan Presensi Akhir Pekan (Weekend)</p>
                                                <p className="text-[11px] text-slate-400">Izinkan presensi pada hari Sabtu dan Minggu</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-800">
                                    <button
                                        onClick={() => handleSave('Absensi')}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
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

                        {/* Notification Settings */}
                        {activeTab === 'notification' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-white mb-4">Pengaturan Notifikasi & Laporan</h3>
                                    <div className="space-y-3 mb-6">
                                        <label className="flex items-center gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="email_reminder"
                                                checked={notificationSettings.email_reminder}
                                                onChange={handleNotificationChange}
                                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
                                            />
                                            <div>
                                                <p className="text-xs font-semibold text-white">Pengingat Presensi Pagi (Email Reminder)</p>
                                                <p className="text-[11px] text-slate-400">Kirim email pengingat kepada guru setiap pagi</p>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="daily_report"
                                                checked={notificationSettings.daily_report}
                                                onChange={handleNotificationChange}
                                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
                                            />
                                            <div>
                                                <p className="text-xs font-semibold text-white">Laporan Rekap Harian</p>
                                                <p className="text-[11px] text-slate-400">Kirim rangkuman presensi harian ke email admin</p>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="monthly_report"
                                                checked={notificationSettings.monthly_report}
                                                onChange={handleNotificationChange}
                                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
                                            />
                                            <div>
                                                <p className="text-xs font-semibold text-white">Laporan Bulanan Otomatis</p>
                                                <p className="text-[11px] text-slate-400">Kirim rekap absensi bulanan dalam format CSV/PDF</p>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Waktu Pengiriman Pengingat
                                            </label>
                                            <input
                                                type="time"
                                                name="reminder_time"
                                                value={notificationSettings.reminder_time}
                                                onChange={handleNotificationChange}
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Email Tujuan Laporan
                                            </label>
                                            <input
                                                type="email"
                                                name="report_email"
                                                value={notificationSettings.report_email}
                                                onChange={handleNotificationChange}
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-800">
                                    <button
                                        onClick={() => handleSave('Notifikasi')}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
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

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-white mb-4">Kebijakan Kata Sandi & Akses</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Panjang Minimum Kata Sandi
                                            </label>
                                            <input
                                                type="number"
                                                name="password_min_length"
                                                value={securitySettings.password_min_length}
                                                onChange={handleSecurityChange}
                                                min="6"
                                                max="32"
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Maksimum Percobaan Login
                                            </label>
                                            <input
                                                type="number"
                                                name="max_login_attempts"
                                                value={securitySettings.max_login_attempts}
                                                onChange={handleSecurityChange}
                                                min="3"
                                                max="10"
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <label className="flex items-center gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="password_require_uppercase"
                                                checked={securitySettings.password_require_uppercase}
                                                onChange={handleSecurityChange}
                                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
                                            />
                                            <div>
                                                <p className="text-xs font-semibold text-white">Wajib Huruf Besar (A-Z)</p>
                                                <p className="text-[11px] text-slate-400">Kata sandi pengguna harus memiliki setidaknya 1 huruf besar</p>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="password_require_number"
                                                checked={securitySettings.password_require_number}
                                                onChange={handleSecurityChange}
                                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
                                            />
                                            <div>
                                                <p className="text-xs font-semibold text-white">Wajib Angka (0-9)</p>
                                                <p className="text-[11px] text-slate-400">Kata sandi pengguna harus memiliki setidaknya 1 angka</p>
                                            </div>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                            Durasi Timeout Sesi Login (Menit)
                                        </label>
                                        <input
                                            type="number"
                                            name="session_timeout"
                                            value={securitySettings.session_timeout}
                                            onChange={handleSecurityChange}
                                            min="15"
                                            max="480"
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 font-mono"
                                        />
                                        <p className="text-[11px] text-slate-500 mt-1">Otomatis logout jika tidak ada aktivitas selama menit ini</p>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-800">
                                    <button
                                        onClick={() => handleSave('Keamanan')}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
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

                        {/* System Info Settings */}
                        {activeTab === 'system' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-white mb-4">Informasi Arsitektur Sistem</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                                <Globe className="w-4 h-4 text-blue-400" />
                                                <span className="text-[11px] font-semibold uppercase tracking-wider">Versi Aplikasi</span>
                                            </div>
                                            <p className="text-lg font-bold text-white">v1.0.0 (Stable)</p>
                                        </div>
                                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                                <Database className="w-4 h-4 text-emerald-400" />
                                                <span className="text-[11px] font-semibold uppercase tracking-wider">Database Engine</span>
                                            </div>
                                            <p className="text-lg font-bold text-white">Supabase PostgreSQL</p>
                                        </div>
                                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                                <Server className="w-4 h-4 text-purple-400" />
                                                <span className="text-[11px] font-semibold uppercase tracking-wider">Backend Server</span>
                                            </div>
                                            <p className="text-lg font-bold text-white">Node.js Express</p>
                                        </div>
                                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                                <HardDrive className="w-4 h-4 text-amber-400" />
                                                <span className="text-[11px] font-semibold uppercase tracking-wider">Storage Cloud</span>
                                            </div>
                                            <p className="text-lg font-bold text-white">Supabase Storage</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-white text-sm">Pencadangan Data (Database Backup)</h4>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Seluruh data presensi dan riwayat guru telah dikonfigurasi dengan pencadangan harian otomatis via Supabase Cloud.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-slate-800">
                                    <button
                                        onClick={() => toast.success('Cache aplikasi berhasil dibersihkan')}
                                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                                    >
                                        Bersihkan Cache
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Pengaturan;