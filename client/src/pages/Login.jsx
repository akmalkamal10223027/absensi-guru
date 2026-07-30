import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Eye, EyeOff, User, Lock, ShieldCheck,
    Sparkles, CheckCircle2, ArrowRight, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import logoImg from '../assets/logo.png';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user, login, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Redirect jika sudah login
    useEffect(() => {
        if (!authLoading && user) {
            const role = String(user.role || '').toLowerCase();
            if (role.includes('admin')) {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/teacher/dashboard', { replace: true });
            }
        }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const loggedInUser = await login(identifier, password);
            toast.success(`Selamat datang kembali, ${loggedInUser.full_name || 'User'}!`);

            const role = String(loggedInUser.role || '').toLowerCase();
            if (role.includes('admin')) {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/teacher/dashboard', { replace: true });
            }
        } catch (error) {
            console.error('Login error:', error);
            const rawErr = error.response?.data?.error;
            const errorMsg = typeof rawErr === 'string'
                ? rawErr
                : (rawErr?.message || 'Login gagal, periksa email/username dan kata sandi.');
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-900 font-sans text-slate-100 selection:bg-blue-500 selection:text-white">
            {/* Left Side - Visual Branding Area */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 flex-col justify-between p-12 overflow-hidden border-r border-slate-800">
                {/* Background Glows */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

                {/* Top Branding Badge */}
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-6">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Sistem Presensi Digital Geolocation</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 p-2 flex items-center justify-center shrink-0 shadow-xl">
                            <img src={logoImg} alt="SMA Al-Hidayah Puspahiang Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-white tracking-tight leading-none">SMA AL-HIDAYAH</h1>
                            <p className="text-xs text-slate-400 mt-1">Puspahiang • Portal Presensi Guru & Admin</p>
                        </div>
                    </div>
                </div>

                {/* Middle Content Highlight */}
                <div className="relative z-10 my-auto py-8">
                    <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                        Presensi Presisi,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-300">
                            Terintegrasi & Realtime
                        </span>
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-md">
                        Mendukung akurasi kehadiran dengan teknologi Geolocation radius GPS dan validasi foto swafoto digital terhubung langsung ke cloud server.
                    </p>

                    <div className="space-y-3 max-w-md">
                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium text-slate-300">Presensi Berbasis Radius GPS Otomatis</span>
                        </div>
                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium text-slate-300">Validasi Foto & Keamanan Supabase</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="relative z-10 pt-4 border-t border-slate-800/60">
                    <p className="text-xs text-slate-500">
                        © 2026 Tim IT SMA Al-Hidayah Puspahiang. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Side - Clean Login Form Container */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80">

                    {/* Mobile Header Branding */}
                    <div className="lg:hidden flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center shrink-0 shadow-md">
                            <img src={logoImg} alt="SMA Al-Hidayah Puspahiang Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">SMA AL-HIDAYAH</h2>
                            <p className="text-xs text-slate-400">Puspahiang • Presensi Guru</p>
                        </div>
                    </div>

                    {/* Form Title */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white">Selamat Datang</h2>
                        <p className="text-xs text-slate-400 mt-1">Silakan masuk ke akun Anda</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Identifier Input */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                Username / Email / NIP
                            </label>
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                                <User className="w-5 h-5 text-slate-400 shrink-0" />
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="Masukkan Username, NIP, atau Email"
                                    className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 font-medium"
                                    style={{ color: '#ffffff' }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                Kata Sandi
                            </label>
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                                <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 font-medium"
                                    style={{ color: '#ffffff' }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-slate-400 hover:text-white shrink-0 transition-colors p-1 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 text-white font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/25"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                                    <span>Memproses Login...</span>
                                </>
                            ) : (
                                <>
                                    <span>Login</span>
                                    <ArrowRight className="w-4 h-4 shrink-0" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Note */}
                    <div className="mt-8 pt-4 border-t border-slate-800 text-center">
                        <p className="text-xs text-slate-500">
                            Sistem Presensi Kehadiran Guru SMA Negeri 1
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;