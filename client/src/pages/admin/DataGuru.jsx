import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { userAPI } from '../../utils/api';
import {
    Users, Plus, Search, Edit2, Trash2, X, CheckCircle,
    AlertCircle, Loader, Filter, ShieldCheck, GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

const DataGuru = () => {
    const [guruList, setGuruList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingGuru, setEditingGuru] = useState(null);
    const [deletingGuru, setDeletingGuru] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        username: '',
        nip: '',
        password: '',
        role: 'guru'
    });

    useEffect(() => {
        fetchGuru();
    }, []);

    const fetchGuru = async () => {
        try {
            const response = await userAPI.getAll();
            setGuruList(response.data.data || []);
        } catch (error) {
            toast.error('Gagal memuat data guru');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const openAddModal = () => {
        setEditingGuru(null);
        setFormData({
            full_name: '',
            email: '',
            username: '',
            nip: '',
            password: '',
            role: 'guru'
        });
        setShowModal(true);
    };

    const openEditModal = (guru) => {
        setEditingGuru(guru);
        setFormData({
            full_name: guru.full_name || '',
            email: guru.email || '',
            username: guru.username || '',
            nip: guru.nip || '',
            password: '',
            role: guru.roles?.name || 'guru'
        });
        setShowModal(true);
    };

    const openDeleteModal = (guru) => {
        setDeletingGuru(guru);
        setShowDeleteModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingGuru) {
                const { password, ...updateData } = formData;
                await userAPI.update(editingGuru.id, updateData);
                toast.success('Data guru berhasil diperbarui');
            } else {
                if (!formData.password) {
                    toast.error('Password wajib diisi untuk guru baru');
                    setSubmitting(false);
                    return;
                }
                await userAPI.create(formData);
                toast.success('Guru baru berhasil ditambahkan');
            }

            setShowModal(false);
            fetchGuru();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Terjadi kesalahan');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingGuru) return;

        setSubmitting(true);
        try {
            await userAPI.delete(deletingGuru.id);
            toast.success('Guru berhasil dihapus');
            setShowDeleteModal(false);
            setDeletingGuru(null);
            fetchGuru();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal menghapus guru');
        } finally {
            setSubmitting(false);
        }
    };

    // Filter guru
    const filteredGuru = guruList.filter((guru) => {
        const matchesSearch =
            guru.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guru.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guru.nip?.includes(searchTerm);

        const matchesRole = filterRole === 'all' || guru.roles?.name?.toLowerCase() === filterRole.toLowerCase();

        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role) => {
        const r = String(role || '').toLowerCase();
        if (r.includes('admin')) {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5 w-fit">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin</span>
                </span>
            );
        }
        return (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5 w-fit">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Guru</span>
            </span>
        );
    };

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Aktif
            </span>
        ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Nonaktif
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-900 text-white">
                <AdminSidebar />
                <div className="flex-1 ml-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-900 font-sans text-slate-100">
            <AdminSidebar />
            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Data Guru & Staf</h1>
                        <p className="text-slate-400 text-sm mt-1">Kelola data pengguna, hak akses, dan akun guru</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Guru</span>
                    </button>
                </div>

                {/* Filter & Search */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-8 shadow-xl">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 flex-1">
                            <Search className="w-4 h-4 text-slate-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Cari nama guru, email, atau NIP..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-slate-500"
                            />
                        </div>
                        <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 sm:w-64">
                            <Filter className="w-4 h-4 text-amber-400 shrink-0" />
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="w-full bg-slate-900 text-white text-xs outline-none border-none cursor-pointer"
                            >
                                <option value="all" className="bg-slate-900 text-white">Semua Role</option>
                                <option value="guru" className="bg-slate-900 text-white">Guru</option>
                                <option value="admin" className="bg-slate-900 text-white">Admin</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pengguna</p>
                                <p className="text-2xl font-bold text-white mt-0.5">{guruList.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Akun Aktif</p>
                                <p className="text-2xl font-bold text-emerald-400 mt-0.5">
                                    {guruList.filter(g => g.is_active).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Akun Nonaktif</p>
                                <p className="text-2xl font-bold text-rose-400 mt-0.5">
                                    {guruList.filter(g => !g.is_active).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-3.5 px-6">Guru</th>
                                    <th className="py-3.5 px-6">NIP</th>
                                    <th className="py-3.5 px-6">Email</th>
                                    <th className="py-3.5 px-6">Role</th>
                                    <th className="py-3.5 px-6">Status</th>
                                    <th className="py-3.5 px-6">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                                {filteredGuru.length > 0 ? (
                                    filteredGuru.map((guru) => (
                                        <tr key={guru.id} className="hover:bg-slate-900/40 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                                        {guru.photo_url ? (
                                                            <img src={guru.photo_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs font-semibold text-white">
                                                                {guru.full_name?.charAt(0) || '?'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white text-sm">{guru.full_name}</p>
                                                        <p className="text-slate-500 text-[11px]">@{guru.username || '-'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-mono text-slate-300">{guru.nip || '-'}</td>
                                            <td className="py-4 px-6 text-slate-300">{guru.email}</td>
                                            <td className="py-4 px-6">{getRoleBadge(guru.roles?.name)}</td>
                                            <td className="py-4 px-6">{getStatusBadge(guru.is_active)}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(guru)}
                                                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(guru)}
                                                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-500">
                                            {searchTerm || filterRole !== 'all'
                                                ? 'Tidak ada data guru yang sesuai dengan pencarian'
                                                : 'Belum ada data guru'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Tambah/Edit */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white">
                                    {editingGuru ? 'Edit Data Guru' : 'Tambah Guru Baru'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                        Nama Lengkap <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: Dewi Lestari, S.Pd"
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                        Email <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="contoh@sman1.sch.id"
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="dewi.lestari"
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">NIP</label>
                                    <input
                                        type="text"
                                        name="nip"
                                        value={formData.nip}
                                        onChange={handleInputChange}
                                        placeholder="198505152010012001"
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                        {editingGuru ? 'Password Baru (opsional)' : 'Password'}
                                        {!editingGuru && <span className="text-rose-500"> *</span>}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
                                        required={!editingGuru}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                        Role <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition-all"
                                        required
                                    >
                                        <option value="guru" className="bg-slate-900 text-white">Guru</option>
                                        <option value="admin" className="bg-slate-900 text-white">Admin</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-700 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-3 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                <span>Memproses...</span>
                                            </>
                                        ) : (
                                            <span>{editingGuru ? 'Simpan' : 'Tambah'}</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Hapus */}
                {showDeleteModal && deletingGuru && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center">
                            <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                                <Trash2 className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Hapus Guru?</h3>
                            <p className="text-xs text-slate-400 mb-6">
                                Yakin ingin menghapus akun <strong>{deletingGuru.full_name}</strong>? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-700 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-rose-600 text-white font-semibold text-xs rounded-xl hover:bg-rose-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader className="w-4 h-4 animate-spin" /> : 'Hapus'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DataGuru;