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

            await attendanceAPI.checkIn(formData);
            toast.success('Absen masuk berhasil!');
            setStep('success');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal melakukan absen masuk');
        } finally {
            setSubmitting(false);
        }
    };

    // Success Screen
    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-600 flex flex-col items-center justify-center p-6 text-white">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Berhasil!</h1>
                <p className="text-green-100 text-center mb-8">
                    Absen masuk Anda telah tercatat
                </p>

                <div className="bg-white/20 backdrop-blur rounded-2xl p-6 w-full max-w-sm mb-8">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-green-100 text-sm">Tanggal</span>
                            <span className="font-semibold">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-green-100 text-sm">Jam</span>
                            <span className="font-semibold">
                                {new Date().toLocaleTimeString('id-ID')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-green-100 text-sm">Status</span>
                            <span className="font-semibold bg-white/30 px-3 py-1 rounded-full text-xs">Hadir</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/teacher/dashboard')}
                    className="w-full max-w-sm bg-white text-green-600 font-bold py-4 rounded-2xl hover:bg-green-50 transition-colors"
                >
                    Kembali ke Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Header */}
            <div className="bg-black/50 backdrop-blur text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-white/10 rounded-lg"
                >
                    <X className="w-6 h-6" />
                </button>
                <h1 className="font-bold text-lg">Absen Masuk</h1>
                <div className="w-10"></div>
            </div>

            {/* Camera View */}
            {step === 'camera' && (
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 relative bg-black">
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
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-64 h-80 border-2 border-white/60 rounded-3xl relative">
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-3xl"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-3xl"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-3xl"></div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-3xl"></div>
                                    </div>
                                </div>

                                {/* Instruction */}
                                <div className="absolute bottom-32 left-0 right-0 text-center">
                                    <p className="text-white text-sm bg-black/50 backdrop-blur px-4 py-2 rounded-full inline-block">
                                        Posisikan wajah di dalam frame
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-white p-6">
                                <Camera className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-center mb-4">Tidak dapat mengakses kamera</p>
                                <button
                                    onClick={startCamera}
                                    className="bg-blue-600 px-6 py-3 rounded-xl font-medium"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {/* Location Status */}
                    <div className="bg-white px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${location ? 'bg-green-100' : 'bg-yellow-100'
                                }`}>
                                {location ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <Loader className="w-5 h-5 text-yellow-600 animate-spin" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-900">
                                    {location ? 'Lokasi Terdeteksi' : 'Mencari Lokasi...'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {location
                                        ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                                        : 'Pastikan GPS aktif'}
                                </p>
                            </div>
                            {location && (
                                <button
                                    onClick={getLocation}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <RefreshCw className="w-4 h-4 text-gray-600" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Capture Button */}
                    <div className="bg-black p-6 flex items-center justify-center">
                        <button
                            onClick={takePhoto}
                            disabled={!location}
                            className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${location
                                    ? 'bg-white hover:scale-105 active:scale-95'
                                    : 'bg-gray-400 opacity-50'
                                }`}
                        >
                            <div className="w-16 h-16 bg-red-500 rounded-full"></div>
                        </button>
                    </div>
                </div>
            )}

            {/* Preview Screen */}
            {step === 'preview' && photo && (
                <div className="flex-1 flex flex-col bg-black">
                    <div className="flex-1 relative">
                        <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    </div>

                    <div className="bg-white px-4 py-4 space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-green-900">Foto & Lokasi Siap</p>
                                <p className="text-xs text-green-700">Tap konfirmasi untuk absen</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={retakePhoto}
                                className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-300 transition-colors"
                            >
                                Foto Ulang
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
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