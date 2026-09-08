import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Eye, EyeOff, User, Lock, ArrowRight, Loader2,
    Download, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import logoImg from '../assets/logo.png';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
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

    // Listener PWA install
    useEffect(() => {
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            setIsInstalled(true);
        }

        const syncPrompt = () => {
            if (window.deferredPrompt) {
                setDeferredPrompt(window.deferredPrompt);
            }
        };

        syncPrompt();

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            window.deferredPrompt = e;
            setDeferredPrompt(e);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            window.deferredPrompt = null;
            toast.success('Aplikasi berhasil terpasang!');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('pwa-prompt-ready', syncPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('pwa-prompt-ready', syncPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        const promptEvent = deferredPrompt || window.deferredPrompt;

        // 1. Jika browser mendukung dialog instalasi PWA langsung
        if (promptEvent) {
            try {
                await promptEvent.prompt();
                const { outcome } = await promptEvent.userChoice;
                if (outcome === 'accepted') {
                    setIsInstalled(true);
                    toast.success('Aplikasi sedang dipasang...');
                }
                setDeferredPrompt(null);
                window.deferredPrompt = null;
                return;
            } catch (err) {
                console.error('PWA install error:', err);
            }
        }

        // 2. Cek apakah tersedia file APK offline di public/absensi-guru.apk
        try {
            const checkApk = await fetch('/absensi-guru.apk', { method: 'HEAD' });
            if (checkApk.ok) {
                const link = document.createElement('a');
                link.href = '/absensi-guru.apk';
                link.download = 'absensi-guru.apk';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Mengunduh file APK, silakan pasang setelah selesai.');
                return;
            }
        } catch {
            // ignore
        }

        // 3. Fallback jika dibuka di browser yang membatasi otomatisasi (misal Safari iOS / desktop non-PWA)
        toast('Buka tautan ini di Google Chrome pada ponsel Android untuk langsung pasang dengan 1 klik.', {
            icon: '📱',
            duration: 4000
        });
    };

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
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-900 font-sans text-slate-100 relative overflow-hidden selection:bg-blue-500 selection:text-white">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Centered Login Card */}
            <div className="w-full max-w-md bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
                {/* Header & Logo */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 p-2.5 flex items-center justify-center shadow-lg shadow-black/40 mb-4">
                        <img
                            src={logoImg}
                            alt="SMA Al-Hidayah Puspahiang Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        SMA AL-HIDAYAH
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Sistem Presensi Guru & Tenaga Kependidikan
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Identifier Input */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                            Username / Email / NIP
                        </label>
                        <div className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                            <User className="w-4 h-4 text-slate-400 shrink-0" />
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
                        <div className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
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
                                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 text-white font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-6 cursor-pointer bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-blue-600/25"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                                <span>Memproses...</span>
                            </>
                        ) : (
                            <>
                                <span>Masuk</span>
                                <ArrowRight className="w-4 h-4 shrink-0" />
                            </>
                        )}
                    </button>
                </form>

                {/* Install App / APK Button */}
                <div className="mt-5 pt-4 border-t border-slate-800/80">
                    {isInstalled ? (
                        <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium py-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Aplikasi telah terpasang</span>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleInstallClick}
                            className="w-full py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800/90 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm group"
                        >
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all">
                                <Download className="w-3.5 h-3.5" />
                            </div>
                            <span>Instal Aplikasi (APK / PWA)</span>
                        </button>
                    )}
                </div>

                {/* Footer Note */}
                <div className="mt-4 pt-3 border-t border-slate-800/40 text-center">
                    <p className="text-[11px] text-slate-500">
                        © 2026 SMA Al-Hidayah Puspahiang
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;