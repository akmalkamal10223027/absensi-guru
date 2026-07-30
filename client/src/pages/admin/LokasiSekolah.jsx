import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { locationAPI } from '../../utils/api';
import {
    MapPin, Edit2, Save, X, CheckCircle, AlertCircle,
    Loader, Navigation, Radius, Building2, Info, Compass
} from 'lucide-react';
import toast from 'react-hot-toast';

const LokasiSekolah = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        radius_meters: 100,
        is_active: true
    });

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const response = await locationAPI.getAll();
            const data = response.data.data || [];
            setLocations(data);

            if (data.length > 0) {
                const loc = data[0];
                setFormData({
                    name: loc.name || '',
                    address: loc.address || '',
                    latitude: loc.latitude?.toString() || '',
                    longitude: loc.longitude?.toString() || '',
                    radius_meters: loc.radius_meters || 100,
                    is_active: loc.is_active
                });
            }
        } catch (error) {
            toast.error('Gagal memuat data lokasi');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (location) => {
        setEditingId(location.id);
        setFormData({
            name: location.name || '',
            address: location.address || '',
            latitude: location.latitude?.toString() || '',
            longitude: location.longitude?.toString() || '',
            radius_meters: location.radius_meters || 100,
            is_active: location.is_active
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        if (locations.length > 0) {
            const loc = locations[0];
            setFormData({
                name: loc.name || '',
                address: loc.address || '',
                latitude: loc.latitude?.toString() || '',
                longitude: loc.longitude?.toString() || '',
                radius_meters: loc.radius_meters || 100,
                is_active: loc.is_active
            });
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.latitude || !formData.longitude) {
            toast.error('Nama, latitude, dan longitude wajib diisi');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: formData.name,
                address: formData.address,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                radius_meters: parseInt(formData.radius_meters),
                is_active: formData.is_active
            };

            if (editingId) {
                await locationAPI.update(editingId, payload);
                toast.success('Lokasi sekolah berhasil diperbarui');
            } else {
                await locationAPI.create(payload);
                toast.success('Lokasi sekolah berhasil ditambahkan');
            }

            setEditingId(null);
            fetchLocations();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal menyimpan lokasi');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Test lokasi dengan GPS browser
    const testMyLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation tidak didukung browser ini');
            return;
        }

        if (!formData.latitude || !formData.longitude) {
            toast.error('Koordinat sekolah belum diisi');
            return;
        }

        setTestResult({ loading: true });

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const schoolLat = parseFloat(formData.latitude);
                const schoolLng = parseFloat(formData.longitude);

                const distance = calculateDistance(userLat, userLng, schoolLat, schoolLng);
                const radius = parseInt(formData.radius_meters) || 100;
                const isValid = distance <= radius;

                setTestResult({
                    loading: false,
                    userLat,
                    userLng,
                    distance: Math.round(distance),
                    radius,
                    isValid,
                    timestamp: new Date().toLocaleTimeString('id-ID')
                });

                if (isValid) {
                    toast.success('Lokasi Anda berada dalam radius presensi sekolah!');
                } else {
                    toast.error(`Lokasi Anda di luar radius sekolah (${Math.round(distance)}m)`);
                }
            },
            (error) => {
                setTestResult({ loading: false, error: true });
                toast.error('Gagal mendapatkan koordinat GPS Anda');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const getMapUrl = () => {
        if (!formData.latitude || !formData.longitude) return '';
        return `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(formData.longitude) - 0.002
            }%2C${parseFloat(formData.latitude) - 0.002}%2C${parseFloat(formData.longitude) + 0.002
            }%2C${parseFloat(formData.latitude) + 0.002}&layer=mapnik&marker=${formData.latitude
            }%2C${formData.longitude}`;
    };

    const getGoogleMapsUrl = () => {
        if (!formData.latitude || !formData.longitude) return '';
        return `https://www.google.com/maps?q=${formData.latitude},${formData.longitude}&z=17`;
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-900 text-white">
                <AdminSidebar />
                <div className="flex-1 lg:ml-64 flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-900 font-sans text-slate-100 overflow-x-hidden">
            <AdminSidebar />
            <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 w-full max-w-full overflow-x-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Pengaturan Lokasi Sekolah</h1>
                        <p className="text-slate-400 text-sm mt-1">Atur titik koordinat GPS dan batas radius presensi guru</p>
                    </div>
                </div>

                {/* Banner Info */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-8 shadow-xl">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                            <Info className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-base">Petunjuk Lokasi & Presensi Geolocation</h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Titik koordinat Latitude dan Longitude digunakan untuk memvalidasi posisi fisik guru saat melakukan presensi (absen masuk/pulang). Guru wajib berada dalam batas radius yang ditentukan untuk dapat menyimpan presensi.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Current Location Card */}
                {locations.length > 0 && !editingId && (
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-8">
                        <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">{locations[0].name}</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">{locations[0].address || 'Alamat belum diisi'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleEdit(locations[0])}
                                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span>Edit Lokasi</span>
                            </button>
                        </div>

                        {/* Map Preview */}
                        <div className="h-64 bg-slate-900 relative">
                            <iframe
                                src={getMapUrl()}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                title="Lokasi Sekolah"
                            ></iframe>
                        </div>

                        {/* Location Details Cards */}
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                    <Navigation className="w-4 h-4 text-blue-400" />
                                    <span className="text-[11px] font-semibold uppercase tracking-wider">Latitude</span>
                                </div>
                                <p className="text-base font-bold text-white font-mono">
                                    {parseFloat(locations[0].latitude).toFixed(6)}
                                </p>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                    <Compass className="w-4 h-4 text-amber-400" />
                                    <span className="text-[11px] font-semibold uppercase tracking-wider">Longitude</span>
                                </div>
                                <p className="text-base font-bold text-white font-mono">
                                    {parseFloat(locations[0].longitude).toFixed(6)}
                                </p>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                    <Radius className="w-4 h-4 text-emerald-400" />
                                    <span className="text-[11px] font-semibold uppercase tracking-wider">Radius Area</span>
                                </div>
                                <p className="text-base font-bold text-emerald-400 font-mono">
                                    {locations[0].radius_meters} Meter
                                </p>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                                    <CheckCircle className="w-4 h-4 text-purple-400" />
                                    <span className="text-[11px] font-semibold uppercase tracking-wider">Status Validasi</span>
                                </div>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${locations[0].is_active
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    }`}>
                                    {locations[0].is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="px-6 pb-6 flex flex-wrap gap-3">
                            <a
                                href={getGoogleMapsUrl()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-colors"
                            >
                                <MapPin className="w-4 h-4 text-rose-400" />
                                <span>Buka di Google Maps</span>
                            </a>
                            <button
                                onClick={testMyLocation}
                                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
                            >
                                <Navigation className="w-4 h-4" />
                                <span>Uji Lokasi GPS Saya</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Test Result Box */}
                {testResult && !testResult.loading && !testResult.error && (
                    <div className={`bg-slate-950/80 border rounded-2xl p-5 mb-8 shadow-xl ${testResult.isValid ? 'border-emerald-500/30' : 'border-rose-500/30'
                        }`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${testResult.isValid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                } shrink-0`}>
                                {testResult.isValid ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className={`font-bold text-base ${testResult.isValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {testResult.isValid ? 'Posisi Anda Dalam Radius Sekolah' : 'Posisi Anda Di Luar Radius Sekolah'}
                                </h3>
                                <p className="text-xs text-slate-300">
                                    Jarak dari titik sekolah: <strong className="text-white">{testResult.distance} meter</strong> (Batas radius: {testResult.radius} meter)
                                </p>
                                <p className="text-[11px] text-slate-500 font-mono pt-1">
                                    Koordinat GPS Anda: {testResult.userLat.toFixed(6)}, {testResult.userLng.toFixed(6)} | Waktu Uji: {testResult.timestamp}
                                </p>
                            </div>
                            <button
                                onClick={() => setTestResult(null)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Edit Form Card */}
                {editingId && (
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl shadow-xl p-6 mb-8">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                            <h2 className="text-lg font-bold text-white">Edit Koordinat & Radius Sekolah</h2>
                            <button
                                onClick={handleCancel}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                        Nama Sekolah / Gedung <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="SMA Negeri 1"
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Alamat Lengkap</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Jl. Pendidikan No. 1"
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                        Latitude <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="latitude"
                                        value={formData.latitude}
                                        onChange={handleInputChange}
                                        placeholder="-6.2088"
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                        Longitude <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="longitude"
                                        value={formData.longitude}
                                        onChange={handleInputChange}
                                        placeholder="106.8456"
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Radius Presensi (Meter)</label>
                                    <input
                                        type="number"
                                        name="radius_meters"
                                        value={formData.radius_meters}
                                        onChange={handleInputChange}
                                        min="10"
                                        max="1000"
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Status Validasi</label>
                                    <label className="flex items-center gap-3 py-3 px-4 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
                                        />
                                        <span className="text-xs font-semibold text-white">
                                            {formData.is_active ? 'Aktif Digunakan' : 'Nonaktif'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-800">
                                <button
                                    onClick={handleCancel}
                                    className="px-5 py-2.5 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-700 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {saving ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>Simpan Perubahan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LokasiSekolah;