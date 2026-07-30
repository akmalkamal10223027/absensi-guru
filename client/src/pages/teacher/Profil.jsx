import { useState, useRef } from 'react';
import MobileLayout from '../../components/MobileLayout';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';
import {
    User, Mail, Lock, Save, Eye, EyeOff, Camera,
    Calendar, Briefcase, Loader, CheckCircle, LogOut,
    ShieldCheck, School, AtSign, Key, Sparkles, Check
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profil = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const [profileForm, setProfileForm] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        username: user?.username || ''
    });

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
        setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar');
            return;
        }

        const formData = new FormData();
        formData.append('photo', file);

        setUploadingPhoto(true);
        try {
            const response = await authAPI.uploadPhoto(formData);
            updateUser(response.data.user || response.data);
            toast.success('Foto profil berhasil diperbarui');
        } catch (error) {
            console.error('Upload photo error:', error);
            toast.error(error.response?.data?.error || 'Gagal mengunggah foto profil');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await authAPI.updateProfile(profileForm);
            updateUser(response.data.user || response.data);
            toast.success('Profil berhasil diperbarui');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal memperbarui profil');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            toast.error('Konfirmasi password tidak cocok');
            return;
        }
        if (passwordForm.new_password.length < 8) {
            toast.error('Password minimal 8 karakter');
            return;
        }

        setSaving(true);
        try {
            await authAPI.changePassword({
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password
            });
            toast.success('Password berhasil diubah');
            setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal mengubah password');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Apakah Anda yakin ingin logout dari akun?')) {
            logout();
            toast.success('Berhasil logout');
            navigate('/login');
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <MobileLayout title="Profil Saya">
            <div className="p-4 space-y-5 pb-24">

                {/* Hero Profile Card */}
                <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 rounded-3xl p-6 text-white text-center shadow-xl border border-slate-800 overflow-hidden">
                    {/* Glowing ambient lights */}
                    <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Avatar Upload Container */}
                    <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 rounded-full bg-slate-800 p-1 ring-4 ring-blue-500/30 shadow-2xl overflow-hidden mx-auto relative group">
                            {user?.photo_url ? (
                                <img src={user.photo_url} alt={user?.full_name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-black">
                                    {getInitials(user?.full_name)}
                                </div>
                            )}

                            {uploadingPhoto && (
                                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur flex items-center justify-center rounded-full">
                                    <Loader className="w-6 h-6 text-blue-400 animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />

                        {/* Camera button trigger */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingPhoto}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 transition-all cursor-pointer hover:scale-105 active:scale-95"
                            title="Ubah Foto Profil"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Profile Information Header */}
                    <h2 className="text-xl font-bold text-white tracking-tight line-clamp-1">
                        {user?.full_name || 'Bapak/Ibu Guru'}
                    </h2>
                    <p className="text-slate-400 text-xs mt-0.5 font-mono">@{user?.username || 'guru'}</p>

                    <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                        <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full text-xs font-semibold backdrop-blur">
                            {user?.nip ? `NIP: ${user.nip}` : 'Tenaga Pendidik'}
                        </span>
                        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-full text-xs font-semibold backdrop-blur">
                            SMA Al-Hidayah Puspahiang
                        </span>
                    </div>
                </div>

                {/* Quick Info Grid Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Bergabung</p>
                            <p className="text-xs font-bold text-slate-800 truncate">
                                {user?.created_at
                                    ? format(new Date(user.created_at), 'd MMM yyyy', { locale: localeId })
                                    : '-'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Status Akun</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <p className="text-xs font-bold text-emerald-600">Aktif</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Form Tabs */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                    {/* Tab Navigation Bar */}
                    <div className="flex p-1.5 bg-slate-100/80 m-3 rounded-2xl">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                activeTab === 'profile'
                                    ? 'bg-white text-slate-900 shadow-md shadow-slate-200'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <User className="w-4 h-4" />
                            Edit Profil
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                activeTab === 'password'
                                    ? 'bg-white text-slate-900 shadow-md shadow-slate-200'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Lock className="w-4 h-4" />
                            Ubah Password
                        </button>
                    </div>

                    <div className="p-5 pt-2">
                        {activeTab === 'profile' && (
                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                        Nama Lengkap <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={profileForm.full_name}
                                            onChange={handleProfileChange}
                                            placeholder="Masukkan nama lengkap"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                            required
                                        />
                                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                        Email <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            name="email"
                                            value={profileForm.email}
                                            onChange={handleProfileChange}
                                            placeholder="contoh@smaalhidayah.sch.id"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                            required
                                        />
                                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="username"
                                            value={profileForm.username}
                                            onChange={handleProfileChange}
                                            placeholder="username_guru"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                        />
                                        <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Simpan Perubahan Profil
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {activeTab === 'password' && (
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                        Password Saat Ini <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? 'text' : 'password'}
                                            name="current_password"
                                            value={passwordForm.current_password}
                                            onChange={handlePasswordChange}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                            required
                                        />
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('current')}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                        Password Baru <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            name="new_password"
                                            value={passwordForm.new_password}
                                            onChange={handlePasswordChange}
                                            placeholder="Minimal 8 karakter"
                                            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                            required
                                        />
                                        <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                        Konfirmasi Password <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            name="confirm_password"
                                            value={passwordForm.confirm_password}
                                            onChange={handlePasswordChange}
                                            placeholder="Ketik ulang password baru"
                                            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                            required
                                        />
                                        <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Requirements Checklist */}
                                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
                                    <p className="font-bold text-slate-700">Persyaratan Password:</p>
                                    <div className={`flex items-center gap-2 ${passwordForm.new_password.length >= 8 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordForm.new_password.length >= 8 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200'}`}>
                                            {passwordForm.new_password.length >= 8 ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>}
                                        </div>
                                        <span>Minimal 8 karakter</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${/[A-Z]/.test(passwordForm.new_password) ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/[A-Z]/.test(passwordForm.new_password) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200'}`}>
                                            {/[A-Z]/.test(passwordForm.new_password) ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>}
                                        </div>
                                        <span>Mengandung minimal 1 huruf besar</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${/[0-9]/.test(passwordForm.new_password) ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/[0-9]/.test(passwordForm.new_password) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200'}`}>
                                            {/[0-9]/.test(passwordForm.new_password) ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>}
                                        </div>
                                        <span>Mengandung minimal 1 angka</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Mengubah...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            Ubah Password Sekarang
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-xs rounded-2xl transition-all border border-rose-500/20 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99]"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>

                {/* Footer note */}
                <p className="text-center text-[11px] text-slate-400 pb-4 font-medium">
                    Sistem Absensi Guru v1.0 • SMA Al-Hidayah Puspahiang
                </p>
            </div>
        </MobileLayout>
    );
};

export default Profil;