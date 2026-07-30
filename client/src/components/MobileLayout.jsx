import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, LogIn, LogOut, History, User,
    Bell, ChevronLeft, Download, X, Info, Megaphone, Clock, Check
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const MobileLayout = ({ children, title, showBack = false }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Jadwal Presensi Masuk',
            message: 'Pengingat: Lakukan presensi masuk sebelum pukul 07:15 WIB di lokasi SMA Al-Hidayah Puspahiang.',
            time: 'Baru saja',
            type: 'info',
            unread: true
        },
        {
            id: 2,
            title: 'Pengumuman Sistem',
            message: 'Sistem Informasi Presensi Kehadiran Guru SMA Al-Hidayah Puspahiang v1.0 telah aktif.',
            time: 'Hari ini, 07:00 WIB',
            type: 'announcement',
            unread: true
        },
        {
            id: 3,
            title: 'Batas Presensi Pulang',
            message: 'Presensi pulang dapat dilakukan setelah jam pelajaran berakhir (mulai pukul 14:00 WIB).',
            time: 'Kemarin',
            type: 'reminder',
            unread: false
        }
    ]);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowInstallBanner(false);
        }
        setDeferredPrompt(null);
    };

    const unreadCount = notifications.filter(n => n.unread).length;

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    };

    const navItems = [
        { path: '/teacher/dashboard', icon: LayoutDashboard, label: 'Beranda' },
        { path: '/teacher/absen-masuk', icon: LogIn, label: 'Masuk' },
        { path: '/teacher/absen-pulang', icon: LogOut, label: 'Pulang' },
        { path: '/teacher/riwayat', icon: History, label: 'Riwayat' },
        { path: '/teacher/profil', icon: User, label: 'Profil' },
    ];

    // Hide navigation header & bar on camera check-in/out screens
    const isCameraPage =
        location.pathname === '/teacher/absen-masuk' ||
        location.pathname === '/teacher/absen-pulang';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto relative shadow-2xl border-x border-slate-200">
            {/* Header */}
            {!isCameraPage && (
                <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            {showBack ? (
                                <button
                                    onClick={() => navigate(-1)}
                                    className="p-2 -ml-2 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                                >
                                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                                </button>
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center shadow-sm shrink-0">
                                    <img src={logoImg} alt="SMA Al-Hidayah Puspahiang Logo" className="w-full h-full object-contain" />
                                </div>
                            )}
                            <div>
                                <h1 className="font-bold text-slate-900 text-sm tracking-tight">{title || 'Absensi Guru'}</h1>
                                <p className="text-[11px] text-slate-500 font-medium">SMA Al-Hidayah Puspahiang</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Functional Notification Bell Button */}
                            <button
                                onClick={() => setShowNotifications(true)}
                                className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-xl relative transition-colors cursor-pointer"
                                title="Notifikasi"
                            >
                                <Bell className="w-5 h-5 text-slate-700" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
                                )}
                            </button>

                            <div className="w-9 h-9 bg-blue-600/10 border border-blue-600/20 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-blue-600">
                                    {user?.full_name?.charAt(0) || '?'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* PWA Install Banner Prompt */}
                    {showInstallBanner && (
                        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-4 py-2 flex items-center justify-between shadow-inner text-xs border-t border-blue-600">
                            <div className="flex items-center gap-2 min-w-0">
                                <Download className="w-4 h-4 text-amber-300 shrink-0 animate-bounce" />
                                <span className="font-semibold truncate">Pasang Aplikasi di HP</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={handleInstallClick}
                                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs transition-colors shadow cursor-pointer"
                                >
                                    Instal
                                </button>
                                <button
                                    onClick={() => setShowInstallBanner(false)}
                                    className="text-white/70 hover:text-white p-1 text-sm font-bold cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}
                </header>
            )}

            {/* Content Body */}
            <main className={`flex-1 ${isCameraPage ? '' : 'pb-24'}`}>
                {children}
            </main>

            {/* Polished Modern Bottom Navigation Bar */}
            {!isCameraPage && (
                <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 z-40 max-w-md mx-auto shadow-2xl">
                    <div className="grid grid-cols-5 h-16 items-center px-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={`relative flex flex-col items-center justify-center h-full py-1.5 transition-all duration-200 ${
                                        isActive ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
                                    }`}
                                >
                                    {/* Active Pill Bar Indicator */}
                                    {isActive && (
                                        <span className="absolute top-0 w-8 h-1 bg-blue-600 rounded-b-full shadow-sm shadow-blue-500/50"></span>
                                    )}

                                    {/* Icon Container */}
                                    <div className={`p-1 rounded-xl transition-all ${
                                        isActive ? 'bg-blue-50 scale-105' : 'bg-transparent'
                                    }`}>
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                    </div>

                                    {/* Label */}
                                    <span className={`text-[10px] mt-0.5 tracking-tight ${
                                        isActive ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'
                                    }`}>
                                        {item.label}
                                    </span>
                                </NavLink>
                            );
                        })}
                    </div>
                    {/* Safe Area inset for modern mobile browsers */}
                    <div className="h-safe-area-inset-bottom bg-white"></div>
                </nav>
            )}

            {/* Notification Drawer Modal */}
            {showNotifications && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-hidden border border-slate-200 shadow-2xl flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Bell className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">Notifikasi</h3>
                                    {unreadCount > 0 && (
                                        <p className="text-[11px] text-blue-600 font-semibold">{unreadCount} belum dibaca</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                    >
                                        Tandai dibaca
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowNotifications(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications Content List */}
                        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => {
                                            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n));
                                        }}
                                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                                            item.unread
                                                ? 'bg-blue-50/60 border-blue-200/80 shadow-sm'
                                                : 'bg-white border-slate-100 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                                item.type === 'announcement'
                                                    ? 'bg-amber-100 text-amber-600'
                                                    : item.type === 'reminder'
                                                        ? 'bg-indigo-100 text-indigo-600'
                                                        : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                {item.type === 'announcement' ? (
                                                    <Megaphone className="w-4 h-4" />
                                                ) : item.type === 'reminder' ? (
                                                    <Clock className="w-4 h-4" />
                                                ) : (
                                                    <Info className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                                    <h4 className="font-bold text-slate-900 text-xs truncate">{item.title}</h4>
                                                    {item.unread && (
                                                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                                                <span className="text-[10px] text-slate-400 mt-1.5 block font-medium">{item.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-slate-400">
                                    <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                    <p className="text-xs">Tidak ada notifikasi saat ini</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-slate-100 text-center bg-slate-50/50 rounded-b-3xl">
                            <button
                                onClick={() => setShowNotifications(false)}
                                className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                Tutup Notifikasi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileLayout;