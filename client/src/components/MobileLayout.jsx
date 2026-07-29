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

    const handleLogout = () => {
        if (window.confirm('Yakin ingin keluar?')) {
            logout();
            navigate('/login');
        }
    };

    const navItems = [
        { path: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/teacher/absen-masuk', icon: LogIn, label: 'Absen Masuk' },
        { path: '/teacher/absen-pulang', icon: LogOut, label: 'Absen Pulang' },
        { path: '/teacher/riwayat', icon: History, label: 'Riwayat' },
        { path: '/teacher/profil', icon: User, label: 'Profil' },
    ];

    // Cek apakah halaman saat ini adalah halaman absen (camera)
    const isCameraPage =
        location.pathname === '/teacher/absen-masuk' ||
        location.pathname === '/teacher/absen-pulang';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative">
            {/* Header */}
            {!isCameraPage && (
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            {showBack ? (
                                <button
                                    onClick={() => navigate(-1)}
                                    className="p-2 -ml-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                                </button>
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-slate-900 p-1 flex items-center justify-center shadow-sm shrink-0">
                                    <img src={logoImg} alt="SMA Negeri 1 Logo" className="w-full h-full object-contain" />
                                </div>
                            )}
                            <div>
                                <h1 className="font-bold text-gray-900 text-sm">{title || 'Absensi Guru'}</h1>
                                <p className="text-xs text-gray-500">SMA Al-Hidayah Puspahiang</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                                <Bell className="w-5 h-5 text-gray-700" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-blue-600">
                                    {user?.full_name?.charAt(0) || '?'}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* Content */}
            <main className={`flex-1 ${isCameraPage ? '' : 'pb-20'}`}>
                {children}
            </main>

            {/* Bottom Navigation */}
            {!isCameraPage && (
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 max-w-md mx-auto">
                    <div className="flex justify-around items-center py-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const isMainAction =
                                item.path === '/teacher/absen-masuk' ||
                                item.path === '/teacher/absen-pulang';

                            if (isMainAction) {
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className="flex flex-col items-center -mt-6"
                                    >
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${isActive
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                                            }`}>
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <span className={`text-xs mt-1 font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'
                                            }`}>
                                            {item.label}
                                        </span>
                                    </NavLink>
                                );
                            }

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={`flex flex-col items-center py-1 px-3 ${isActive ? 'text-blue-600' : 'text-gray-500'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="text-xs mt-1 font-medium">{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                    {/* Safe area for iPhone */}
                    <div className="h-safe-area-inset-bottom bg-white"></div>
                </nav>
            )}
        </div>
    );
};

export default MobileLayout;