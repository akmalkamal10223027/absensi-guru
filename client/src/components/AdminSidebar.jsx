import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, ClipboardCheck, FileText,
    Clock, MapPin, Settings, User, LogOut
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/data-guru', icon: Users, label: 'Data Guru' },
    { path: '/admin/absensi', icon: ClipboardCheck, label: 'Absensi' },
    { path: '/admin/rekap-laporan', icon: FileText, label: 'Rekap & Laporan' },
    { path: '/admin/jam-kerja', icon: Clock, label: 'Jam Kerja' },
    { path: '/admin/lokasi-sekolah', icon: MapPin, label: 'Lokasi Sekolah' },
    { path: '/admin/pengaturan', icon: Settings, label: 'Pengaturan' },
    { path: '/admin/akun', icon: User, label: 'Akun' },
];

const AdminSidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen fixed left-0 top-0 border-r border-slate-800">
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center justify-center shrink-0 shadow-md">
                        <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="font-bold text-sm text-white tracking-tight">ABSENSI GURU</h1>
                        <p className="text-xs text-slate-400">SMA NEGERI 1</p>
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
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.full_name || 'Admin'}</p>
                        <p className="text-xs text-slate-400">Super Admin</p>
                    </div>
                </div>
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

export default AdminSidebar;