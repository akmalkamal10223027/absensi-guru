import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI } from '../../utils/api';
import { Camera, MapPin, CheckCircle, X, Loader, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const CheckIn = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState('camera'); // camera, preview, success
    const [cameraError, setCameraError] = useState(false);
    const [checkInResult, setCheckInResult] = useState(null);

    useEffect(() => {
        startCamera();
        getLocation();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            setCameraError(false);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStream(mediaStream);
        } catch (error) {
            console.error('Camera error:', error);
            setCameraError(true);
            toast.error('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
        }
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation tidak didukung');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                setLoading(false);
            },
            (error) => {
                setLoading(false);
                toast.error('Gagal mendapatkan lokasi. Pastikan GPS aktif.');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            setPhoto(canvas.toDataURL('image/jpeg', 0.8));
            setStep('preview');
        }
    };

    const retakePhoto = () => {
        setPhoto(null);
        setStep('camera');
    };

    const handleSubmit = async () => {
        if (!photo || !location) {
            toast.error('Foto dan lokasi diperlukan');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(photo);
            const blob = await response.blob();
            const file = new File([blob], 'checkin.jpg', { type: 'image/jpeg' });

            const formData = new FormData();
            formData.append('photo', file);
            formData.append('latitude', location.latitude);
            formData.append('longitude', location.longitude);

            const res = await attendanceAPI.checkIn(formData);
            const resData = res.data;
            setCheckInResult(resData);

            const status = resData?.status || resData?.attendance?.status;
            if (status === 'terlambat') {
                toast.error('Absen masuk tercatat: Terlambat');
            } else {
                toast.success('Absen masuk berhasil: Tepat Waktu');
            }
            setStep('success');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal melakukan absen masuk');
        } finally {
            setSubmitting(false);
        }
    };

    // Success Screen
    if (step === 'success') {
        const currentStatus = checkInResult?.status || checkInResult?.attendance?.status || 'hadir';
        const isTerlambat = currentStatus === 'terlambat';

        return (
            <div className={`min-h-screen bg-gradient-to-br ${isTerlambat ? 'from-amber-500 to-amber-600' : 'from-emerald-500 to-emerald-600'} flex flex-col items-center justify-center p-6 text-white`}>
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle className={`w-16 h-16 ${isTerlambat ? 'text-amber-500' : 'text-emerald-500'}`} />
                </div>
                <h1 className="text-3xl font-bold mb-2">
                    {isTerlambat ? 'Absen Terlambat!' : 'Berhasil!'}
                </h1>
                <p className={`${isTerlambat ? 'text-amber-100' : 'text-emerald-100'} text-center mb-8`}>
                    {isTerlambat ? 'Absen masuk Anda telah tercatat (Terlambat)' : 'Absen masuk Anda telah tercatat (Tepat Waktu)'}
                </p>

                <div className="bg-white/20 backdrop-blur rounded-2xl p-6 w-full max-w-sm mb-8">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className={`${isTerlambat ? 'text-amber-100' : 'text-emerald-100'} text-sm`}>Tanggal</span>
                            <span className="font-semibold">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className={`${isTerlambat ? 'text-amber-100' : 'text-emerald-100'} text-sm`}>Jam</span>
                            <span className="font-semibold">
                                {new Date().toLocaleTimeString('id-ID')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className={`${isTerlambat ? 'text-amber-100' : 'text-emerald-100'} text-sm`}>Status</span>
                            <span className="font-semibold bg-white/30 px-3 py-1 rounded-full text-xs">
                                {isTerlambat ? 'Terlambat' : 'Hadir Tepat Waktu'}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/teacher/dashboard')}
                    className={`w-full max-w-sm bg-white ${isTerlambat ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'} font-bold py-4 rounded-2xl transition-colors`}
                >
                    Kembali ke Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black flex flex-col overflow-hidden z-50">
            {/* Header */}
            <div className="h-14 bg-black/70 backdrop-blur-md text-white px-4 flex items-center justify-between shrink-0 border-b border-white/10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 hover:bg-white/10 active:bg-white/20 rounded-xl transition-colors cursor-pointer"
                >
                    <X className="w-6 h-6" />
                </button>
                <h1 className="font-bold text-base tracking-wide">Absen Masuk</h1>
                <div className="w-8"></div>
            </div>

            {/* Camera View */}
            {step === 'camera' && (
                <div className="flex-1 min-h-0 flex flex-col bg-black relative">
                    <div className="flex-1 min-h-0 relative bg-black overflow-hidden flex items-center justify-center">
                        {!cameraError ? (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                {/* Face Frame Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                                    <div className="w-56 h-72 sm:w-64 sm:h-80 max-h-[60vh] border-2 border-white/60 rounded-3xl relative">
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-3xl"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-3xl"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-3xl"></div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-3xl"></div>
                                    </div>
                                </div>

                                {/* Instruction */}
                                <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none z-10">
                                    <p className="text-white text-xs bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full inline-block font-medium">
                                        Posisikan wajah di dalam frame
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-white p-6">
                                <Camera className="w-16 h-16 mb-4 opacity-50 text-slate-400" />
                                <p className="text-center text-sm mb-4 text-slate-300">Tidak dapat mengakses kamera</p>
                                <button
                                    onClick={startCamera}
                                    className="bg-blue-600 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-500 transition-colors cursor-pointer"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {/* Location Status */}
                    <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${location ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                {location ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : (
                                    <Loader className="w-4 h-4 animate-spin" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-xs text-white truncate">
                                    {location ? 'Lokasi Terdeteksi' : 'Mencari Lokasi GPS...'}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">
                                    {location
                                        ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                                        : 'Pastikan GPS aktif & beri izin lokasi'}
                                </p>
                            </div>
                            {location && (
                                <button
                                    onClick={getLocation}
                                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg shrink-0 transition-colors cursor-pointer"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Capture Button Bar */}
                    <div className="bg-black py-3.5 px-6 shrink-0 flex items-center justify-center">
                        <button
                            onClick={takePhoto}
                            disabled={!location}
                            className={`w-16 h-16 rounded-full border-4 border-white flex items-center justify-center transition-all ${location
                                    ? 'bg-white hover:scale-105 active:scale-95 cursor-pointer'
                                    : 'bg-gray-500 opacity-40 cursor-not-allowed'
                                }`}
                        >
                            <div className="w-12 h-12 bg-red-500 rounded-full"></div>
                        </button>
                    </div>
                </div>
            )}

            {/* Preview Screen */}
            {step === 'preview' && photo && (
                <div className="flex-1 min-h-0 flex flex-col bg-black">
                    <div className="flex-1 min-h-0 relative bg-black overflow-hidden">
                        <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    </div>

                    <div className="bg-slate-900 border-t border-slate-800 px-4 py-4 shrink-0 space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-xs text-emerald-300">Foto & Lokasi Terverifikasi</p>
                                <p className="text-[11px] text-emerald-400/80">Klik konfirmasi untuk mencatat presensi</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={retakePhoto}
                                className="flex-1 py-3 bg-slate-800 text-slate-200 font-semibold text-sm rounded-xl hover:bg-slate-700 active:bg-slate-600 transition-colors cursor-pointer"
                            >
                                Foto Ulang
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-500 active:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
                            >
                                {submitting ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Konfirmasi
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckIn;