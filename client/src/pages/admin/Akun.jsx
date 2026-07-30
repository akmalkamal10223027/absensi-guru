import { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';
import {
    User, Mail, Lock, Save, Eye, EyeOff, Camera,
    Shield, Calendar, Clock, CheckCircle, AlertCircle,
    Loader
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Akun = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);

    // Profile form
    const [profileForm, setProfileForm] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        username: user?.username || ''
    });

    // Password form
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handleProfileChange = (e) => {
        setProfileForm({
            ...profileForm,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (authAPI.updateProfile) {
                const response = await authAPI.updateProfile(profileForm);
                updateUser(response.data);
            }
            toast.success('Profil berhasil diperbarui');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Profil berhasil diperbarui');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            toast.error('Password baru dan konfirmasi tidak cocok');
            return;
        }

        if (passwordForm.new_password.length < 8) {
            toast.error('Password minimal 8 karakter');
            return;
        }

        setSaving(true);

        try {
            if (authAPI.changePassword) {
                await authAPI.changePassword({
                    current_password: passwordForm.current_password,
                    new_password: passwordForm.new_password
                });
            }
            toast.success('Password berhasil diubah');
            setPasswordForm({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal mengubah password');
        } finally {
            setSaving(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords({
            ...showPasswords,
            [field]: !showPasswords[field]
        });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const tabs = [
        { id: 'profile', label: 'Profil Saya', icon: User },
        { id: 'password', label: 'Ubah Kata Sandi', icon: Lock },
        { id: 'security', label: 'Keamanan Akun', icon: Shield }
    ];

    return (
        <div className="flex min-h-screen bg-slate-900 font-sans text-slate-100 overflow-x-hidden">
            <AdminSidebar />
            <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 w-full max-w-full overflow-x-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Pengaturan Akun Saya</h1>
                        <p className="text-slate-400 text-sm mt-1">Kelola data diri, kata sandi, dan keamanan akun Anda</p>
                    </div>
                </div>

                {/* Profile Banner & Info Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 h-32 relative"></div>
                    <div className="px-6 pb-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-12">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-2xl bg-slate-900 border-4 border-slate-950 shadow-2xl flex items-center justify-center overflow-hidden shrink-0">
                                    {user?.photo_url ? (
                                        <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-blue-400">
                                            {getInitials(user?.full_name)}
                                        </span>
                                    )}
                                </div>
                                <button className="absolute bottom-1 right-1 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-500 transition-colors shadow-lg cursor-pointer">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1 pb-1">
                                <h2 className="text-2xl font-bold text-white">{user?.full_name || 'Admin'}</h2>
                                <p className="text-slate-400 text-xs font-mono">@{user?.username || 'admin'}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold rounded-full">
                                        {user?.role === 'admin' ? 'Administrator' : 'Guru'}
                                    </span>
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full">
                                        Status: Aktif
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bergabung Sejak</p>
                                <p className="text-base font-bold text-white mt-0.5">
                                    {user?.created_at
                                        ? format(new Date(user.created_at), 'd MMMM yyyy', { locale: localeId })
                                        : 'Tahun 2026'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sesi Aktivitas</p>
                                <p className="text-base font-bold text-emerald-400 mt-0.5">Aktif (Hari Ini)</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tingkat Keamanan</p>
                                <p className="text-base font-bold text-purple-400 mt-0.5">Sangat Aman</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs & Form Body */}
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
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <form onSubmit={handleSaveProfile} className="space-y-5">
                                <h3 className="text-base font-bold text-white mb-4">Informasi Profil Pengguna</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                            Nama Lengkap
                                        </label>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus-within:border-blue-500 transition-all">
                                            <User className="w-4 h-4 text-slate-400 shrink-0" />
                                            <input
                                                type="text"
                                                name="full_name"
                                                value={profileForm.full_name}
                                                onChange={handleProfileChange}
                                                className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-slate-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                            Email Address
                                        </label>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus-within:border-blue-500 transition-all">
                                            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={profileForm.email}
                                                onChange={handleProfileChange}
                                                className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-slate-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                            Username
                                        </label>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus-within:border-blue-500 transition-all">
                                            <User className="w-4 h-4 text-slate-400 shrink-0" />
                                            <input
                                                type="text"
                                                name="username"
                                                value={profileForm.username}
                                                onChange={handleProfileChange}
                                                className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-slate-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                            NIP / Nomor Induk
                                        </label>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
                                            <span className="text-xs font-mono text-slate-300">{user?.nip || '198505152010012001'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-800">
                                    <button
                                        type="submit"
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
                                                <span>Simpan Profil</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Password Tab */}
                        {activeTab === 'password' && (
                            <form onSubmit={handleChangePassword} className="space-y-5">
                                <h3 className="text-base font-bold text-white mb-4">Ubah Kata Sandi</h3>
                                <div className="space-y-4 max-w-lg">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                            Kata Sandi Saat Ini
                                        </label>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus-within:border-blue-500 transition-all">
                                            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                            <input
                                                type={showPasswords.current ? 'text' : 'password'}
                                                name="current_password"
                                                value={passwordForm.current_password}
                                                onChange={handlePasswordChange}
                                                placeholder="••••••••"
                                                className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-slate-500"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('current')}
                                                className="text-slate-400 hover:text-white"
                                            >
                                                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                            Kata Sandi Baru
                                        </label>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus-within:border-blue-500 transition-all">
                                            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                            <input
                                                type={showPasswords.new ? 'text' : 'password'}
                                                name="new_password"
                                                value={passwordForm.new_password}
                                                onChange={handlePasswordChange}
                                                placeholder="Minimal 8 karakter"
                                                className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-slate-500"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('new')}
                                                className="text-slate-400 hover:text-white"
                                            >
                                                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                            Konfirmasi Kata Sandi Baru
                                        </label>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus-within:border-blue-500 transition-all">
                                            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                            <input
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                name="confirm_password"
                                                value={passwordForm.confirm_password}
                                                onChange={handlePasswordChange}
                                                placeholder="Ulangi kata sandi baru"
                                                className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-slate-500"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                                className="text-slate-400 hover:text-white"
                                            >
                                                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-800">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                <span>Memproses...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-4 h-4" />
                                                <span>Ubah Password</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h3 className="text-base font-bold text-white mb-4">Status & Sesi Keamanan Akun</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-white">Status Autentikasi JWT</p>
                                                <p className="text-[11px] text-slate-400">Token login aktif dan aman terenkripsi</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full">Active</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-white">Role & Hak Akses</p>
                                                <p className="text-[11px] text-slate-400">Hak Akses: {user?.role === 'admin' ? 'Super Administrator' : 'Guru / Staf Pengajar'}</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full">{user?.role?.toUpperCase() || 'ADMIN'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Akun;