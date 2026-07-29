import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI } from '../../utils/api';
import { Camera, CheckCircle, X, Loader, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const CheckOut = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState('camera');
    const [cameraError, setCameraError] = useState(false);

    useEffect(() => {
        startCamera();
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
                video: { facingMode: 'user' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStream(mediaStream);
        } catch (error) {
            setCameraError(true);
            toast.error('Tidak dapat mengakses kamera');
        }
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

    const handleSubmit = async () => {
        if (!photo) {
            toast.error('Foto diperlukan');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(photo);
            const blob = await response.blob();
            const file = new File([blob], 'checkout.jpg', { type: 'image/jpeg' });

            const formData = new FormData();
            formData.append('photo', file);

            await attendanceAPI.checkOut(formData);
            toast.success('Absen pulang berhasil!');
            setStep('success');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal melakukan absen pulang');
        } finally {
            setSubmitting(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center p-6 text-white">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle className="w-16 h-16 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Sampai Jumpa!</h1>
                <p className="text-blue-100 text-center mb-8">
                    Absen pulang Anda telah tercatat
                </p>

                <div className="bg-white/20 backdrop-blur rounded-2xl p-6 w-full max-w-sm mb-8">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-blue-100 text-sm">Tanggal</span>
                            <span className="font-semibold">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-blue-100 text-sm">Jam Pulang</span>
                            <span className="font-semibold">
                                {new Date().toLocaleTimeString('id-ID')}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/teacher/dashboard')}
                    className="w-full max-w-sm bg-white text-blue-600 font-bold py-4 rounded-2xl hover:bg-blue-50 transition-colors"
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
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-lg">
                    <X className="w-6 h-6" />
                </button>
                <h1 className="font-bold text-lg">Absen Pulang</h1>
                <div className="w-10"></div>
            </div>

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
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-64 h-80 border-2 border-white/60 rounded-3xl relative">
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-3xl"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-3xl"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-3xl"></div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-3xl"></div>
                                    </div>
                                </div>
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
                                <button onClick={startCamera} className="bg-blue-600 px-6 py-3 rounded-xl font-medium">
                                    Coba Lagi
                                </button>
                            </div>
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                    <div className="bg-black p-6 flex items-center justify-center">
                        <button
                            onClick={takePhoto}
                            className="w-20 h-20 rounded-full border-4 border-white bg-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                        >
                            <div className="w-16 h-16 bg-green-500 rounded-full"></div>
                        </button>
                    </div>
                </div>
            )}

            {step === 'preview' && photo && (
                <div className="flex-1 flex flex-col bg-black">
                    <div className="flex-1 relative">
                        <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    </div>

                    <div className="bg-white px-4 py-4 space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-blue-900">Foto Siap</p>
                                <p className="text-xs text-blue-700">Tap konfirmasi untuk absen pulang</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setPhoto(null); setStep('camera'); }}
                                className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-300"
                            >
                                Foto Ulang
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
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

export default CheckOut;