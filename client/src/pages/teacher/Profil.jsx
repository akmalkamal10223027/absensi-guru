import { useState } from 'react';
import MobileLayout from '../../components/MobileLayout';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';
import {
    User, Mail, Lock, Save, Eye, EyeOff, Camera,
    Calendar, Briefcase, Loader, CheckCircle, LogOut
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profil = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);

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

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await authAPI.updateProfile(profileForm);
            updateUser(response.data);
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
            toast.error('Password tidak cocok');
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
        if (window.confirm('Yakin ingin keluar?')) {
            logout();
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
            <div className="p-4 space-y-4">
                {/* Profile Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white text-center">
                    <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 rounded-full bg-white border-4 border-white/30 flex items-center justify-center mx-auto overflow-hidden">
                            {user?.photo_url ? (
                                <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-blue-600">
                                    {getInitials(user?.full_name)}
                                </span>
                            )}
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                            <Camera className="w-4 h-4 text-white" />
                        </button>
                    </div>
                    <h2 className="text-xl font-bold">{user?.full_name}</h2>
                    <p className="text-blue-200 text-sm mt-1">@{user?.username || 'guru'}</p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium">
                            {user?.nip ? `NIP: ${user.nip}` : 'Guru'}
                        </span>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-gray-500">Bergabung</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                            {user?.created_at
                                ? format(new Date(user.created_at), 'd MMM yyyy', { locale: localeId })
                                : '-'}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-gray-500">Status</span>
                        </div>
                        <p className="text-sm font-semibold text-green-600">Aktif</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'profile'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500'
                                }`}
                        >
                            Profil
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'password'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500'
                                }`}
                        >
                            Password
                        </button>
                    </div>

                    <div className="p-4">
                        {activeTab === 'profile' && (
                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={profileForm.full_name}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileForm.email}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={profileForm.username}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Simpan Perubahan
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {activeTab === 'password' && (
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Password Saat Ini</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? 'text' : 'password'}
                                            name="current_password"
                                            value={passwordForm.current_password}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('current')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                        >
                                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Password Baru</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            name="new_password"
                                            value={passwordForm.new_password}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                        >
                                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Konfirmasi Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            name="confirm_password"
                                            value={passwordForm.confirm_password}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Requirements */}
                                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                                    <p className="text-xs font-medium text-gray-700">Persyaratan:</p>
                                    <div className={`flex items-center gap-2 text-xs ${passwordForm.new_password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                                        {passwordForm.new_password.length >= 8 ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>}
                                        Minimal 8 karakter
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs ${/[A-Z]/.test(passwordForm.new_password) ? 'text-green-600' : 'text-gray-500'}`}>
                                        {/[A-Z]/.test(passwordForm.new_password) ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>}
                                        Mengandung huruf besar
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs ${/[0-9]/.test(passwordForm.new_password) ? 'text-green-600' : 'text-gray-500'}`}>
                                        {/[0-9]/.test(passwordForm.new_password) ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>}
                                        Mengandung angka
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Mengubah...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-5 h-5" />
                                            Ubah Password
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
                    className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-200"
                >
                    <LogOut className="w-5 h-5" />
                    Keluar dari Akun
                </button>

                <p className="text-center text-xs text-gray-400 pb-4">
                    Versi 1.0.0 • SMA Negeri 1
                </p>
            </div>
        </MobileLayout>
    );
};

export default Profil;