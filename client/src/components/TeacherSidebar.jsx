import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, LogIn, LogOut, History, User, School
} from 'lucide-react';

const menuItems = [
    { path: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/teacher/absen-masuk', icon: LogIn, label: 'Absen Masuk' },
    { path: '/teacher/absen-pulang', icon: LogOut, label: 'Absen Pulang' },
    { path: '/teacher/riwayat', icon: History, label: 'Riwayat Absensi' },
    { path: '/teacher/profil', icon: User, label: 'Profil Saya' },
];

const TeacherSidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen fixed left-0 top-0">
            <div className="p-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <School className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                        <h1 className="font-bold text-sm">ABSENSI GURU</h1>
                        <p className="text-xs text-slate-400">SMA AL-HIDAYAH PUSPAHIANG</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-700">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Keluar
                </button>
            </div>
        </aside>
    );
};

export default TeacherSidebar;