import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, ClipboardCheck, FileText,
    Clock, MapPin, Settings, User, LogOut, Menu, X
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
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile Top Header Navbar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between z-40">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                        aria-label="Toggle Menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-slate-950 border border-slate-800 rounded-lg p-1 flex items-center justify-center shrink-0">
                            <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-bold text-sm text-white tracking-tight">ADMIN PANEL</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                        {user?.full_name?.charAt(0) || 'A'}
                    </div>
                </div>
            </div>

            {/* Mobile Backdrop Overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-45 transition-opacity"
                />
            )}

            {/* Sidebar Drawer Container */}
            <aside className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}>
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center justify-center shrink-0 shadow-md">
                            <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="font-bold text-sm text-white tracking-tight">ABSENSI GURU</h1>
                            <p className="text-xs text-slate-400">SMA AL-HIDAYAH</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${isActive
                                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User & Logout */}
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-slate-950/60 border border-slate-800">
                        <div className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center shrink-0">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.full_name || 'Admin'}</p>
                            <p className="text-xs text-slate-400">Super Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-300 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;