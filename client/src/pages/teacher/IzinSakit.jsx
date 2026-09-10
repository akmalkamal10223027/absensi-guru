import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import { attendanceAPI } from '../../utils/api';
import {
    FileText, HeartPulse, Upload, Camera, CheckCircle2,
    AlertCircle, X, Calendar, ArrowLeft, Clock, FileCheck2, Info
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import toast from 'react-hot-toast';

const IzinSakit = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const [permitType, setPermitType] = useState('izin'); // 'izin' or 'sakit'
    const [notes, setNotes] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [checkingToday, setCheckingToday] = useState(true);
    const [existingAttendance, setExistingAttendance] = useState(null);

    const todayFormatted = format(new Date(), 'EEEE, d MMMM yyyy', { locale: localeId });

    useEffect(() => {
        checkTodayStatus();
    }, []);

    const checkTodayStatus = async () => {
        try {
            const res = await attendanceAPI.getToday();
            if (res.data?.attendance) {
                setExistingAttendance(res.data.attendance);
            }
        } catch (error) {
            console.error('Error checking today status:', error);
        } finally {
            setCheckingToday(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Ukuran file maksimal 5MB');
                return;
            }
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!notes.trim()) {
            toast.error('Mohon masukkan alasan atau keterangan');
            return;
        }

        if (permitType === 'sakit' && !selectedFile) {
            toast.error('Disarankan melampirkan surat dokter atau bukti foto sakit');
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('status', permitType);
            formData.append('notes', notes.trim());
            if (selectedFile) {
                formData.append('photo', selectedFile);
            }

            const res = await attendanceAPI.submitPermit(formData);
            toast.success(res.data?.message || 'Pengajuan berhasil dikirim');
            navigate('/teacher/dashboard');
        } catch (error) {
            console.error('Error submitting permit:', error);
            toast.error(error.response?.data?.error || 'Gagal mengirim pengajuan');
        } finally {
            setLoading(false);
        }
    };

    const isAlreadySubmitted = !!existingAttendance;

    return (
        <MobileLayout title="Pengajuan Izin / Sakit" showBack={true}>
            <div className="p-4 space-y-4 pb-20">
                {/* Header Card */}
                <div className={`relative rounded-3xl p-5 text-white shadow-xl overflow-hidden transition-all duration-300 ${
                    permitType === 'izin'
                        ? 'bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 border border-blue-800/60'
                        : 'bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 border border-purple-800/60'
                }`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15 text-xs font-semibold tracking-wide mb-2">
                                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                                {todayFormatted}
                            </span>
                            <h2 className="text-xl font-extrabold text-white tracking-tight">
                                {permitType === 'izin' ? 'Formulir Permohonan Izin' : 'Surat Keterangan Sakit'}
                            </h2>
                            <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                                {permitType === 'izin'
                                    ? 'Ajukan permohonan izin dinas luar atau keperluan mendesak.'
                                    : 'Laporkan kondisi kesehatan berhalangan hadir beserta surat dokter.'}
                            </p>
                        </div>

                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                            permitType === 'izin'
                                ? 'bg-blue-600/30 border border-blue-400/40 text-blue-300'
                                : 'bg-purple-600/30 border border-purple-400/40 text-purple-300'
                        }`}>
                            {permitType === 'izin' ? <FileText className="w-6 h-6" /> : <HeartPulse className="w-6 h-6" />}
                        </div>
                    </div>
                </div>

                {/* Status Warning if Already Recorded */}
                {checkingToday ? (
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-xs text-slate-500">Memeriksa status presensi hari ini...</span>
                    </div>
                ) : isAlreadySubmitted ? (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-900 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-sm text-amber-700">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <span>Presensi Hari Ini Sudah Tercatat</span>
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed">
                            Anda sudah memiliki catatan presensi dengan status{' '}
                            <span className="font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-800">
                                {existingAttendance.status}
                            </span>{' '}
                            hari ini. Anda tidak dapat melakukan pengajuan ulang.
                        </p>
                        <button
                            onClick={() => navigate('/teacher/dashboard')}
                            className="mt-2 w-full py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition"
                        >
                            Kembali ke Dashboard
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Type Switcher / Segmented Control */}
                        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200 grid grid-cols-2 gap-1.5">
                            <button
                                type="button"
                                onClick={() => setPermitType('izin')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                    permitType === 'izin'
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                        : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <FileText className="w-4 h-4" />
                                <span>Izin (Keperluan)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPermitType('sakit')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                    permitType === 'sakit'
                                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                                        : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <HeartPulse className="w-4 h-4" />
                                <span>Sakit (Kesehatan)</span>
                            </button>
                        </div>

                        {/* Reason / Notes Input */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <FileCheck2 className="w-4 h-4 text-blue-600" />
                                    Alasan & Keterangan Lengkap <span className="text-rose-500">*</span>
                                </label>
                                <span className="text-[11px] text-slate-400">{notes.length}/250</span>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value.slice(0, 250))}
                                placeholder={
                                    permitType === 'izin'
                                        ? 'Contoh: Izin dinas menghadiri workshop kurikulum di dinas pendidikan, atau ada urusan keluarga mendesak...'
                                        : 'Contoh: Mengalami demam tinggi dan flu, disarankan istirahat oleh dokter klinik...'
                                }
                                rows={4}
                                required
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400 resize-none"
                            />
                            <p className="text-[11px] text-slate-400 leading-tight">
                                Berikan penjelasan yang jelas dan ringkas mengenai alasan tidak dapat hadir mengajar.
                            </p>
                        </div>

                        {/* File / Surat Bukti Attachment */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <Camera className="w-4 h-4 text-indigo-600" />
                                    Foto Bukti / Surat Keterangan
                                    {permitType === 'sakit' && (
                                        <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                            Surat Dokter
                                        </span>
                                    )}
                                </label>
                                <span className="text-[11px] text-slate-400">Opsional / Disarankan</span>
                            </div>

                            {/* Hidden Inputs for File or Camera */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {/* Preview or Upload Area */}
                            {previewUrl ? (
                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-inner">
                                    <img
                                        src={previewUrl}
                                        alt="Bukti Pengajuan"
                                        className="w-full max-h-56 object-cover object-center"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3">
                                        <span className="text-[11px] text-white font-medium truncate max-w-[200px]">
                                            {selectedFile?.name || 'Foto terlampir'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md hover:bg-rose-700 transition"
                                        >
                                            <X className="w-3.5 h-3.5" /> Hapus
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => cameraInputRef.current?.click()}
                                        className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-2 text-slate-600 transition-all cursor-pointer group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 flex items-center justify-center transition-transform">
                                            <Camera className="w-5 h-5" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs font-bold text-slate-800">Ambil Foto</p>
                                            <p className="text-[10px] text-slate-400">Gunakan Kamera</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 flex flex-col items-center justify-center gap-2 text-slate-600 transition-all cursor-pointer group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 flex items-center justify-center transition-transform">
                                            <Upload className="w-5 h-5" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs font-bold text-slate-800">Pilih File</p>
                                            <p className="text-[10px] text-slate-400">Galeri / Dokumen</p>
                                        </div>
                                    </button>
                                </div>
                            )}

                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-[11px]">
                                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <span>Lampiran dokumen atau foto surat dokter akan diteruskan ke administrator sekolah untuk verifikasi laporan.</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-2xl font-bold text-sm text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                                permitType === 'izin'
                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 active:scale-98'
                                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25 active:scale-98'
                            } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Sedang Mengirim Pengajuan...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Kirim Pengajuan {permitType === 'izin' ? 'Izin' : 'Sakit'}</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </MobileLayout>
    );
};

export default IzinSakit;
