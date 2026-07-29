import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, LogIn, LogOut, History, User,
    Bell, ChevronLeft
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const MobileLayout = ({ children, title, showBack = false }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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
                                    className="p-2 -ml-2 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors"
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
                            <button className="p-2 hover:bg-slate-100 rounded-xl relative transition-colors">
                                <Bell className="w-5 h-5 text-slate-700" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                            </button>
                            <div className="w-9 h-9 bg-blue-600/10 border border-blue-600/20 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-blue-600">
                                    {user?.full_name?.charAt(0) || '?'}
                                </span>
                            </div>
                        </div>
                    </div>
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
        </div>
    );
};

export default MobileLayout;