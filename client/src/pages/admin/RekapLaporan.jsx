import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { attendanceAPI, userAPI } from '../../utils/api';
import {
    Calendar, Filter, Download, Printer, FileText,
    CheckCircle, AlertCircle, XCircle, Users,
    BarChart3, Search, TrendingUp
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import toast from 'react-hot-toast';

// Import jsPDF dan autoTable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import kopImg from '../../assets/kop-surat.png';

const RekapLaporan = () => {
    const [loading, setLoading] = useState(true);
    const [rekapData, setRekapData] = useState([]);
    const [guruList, setGuruList] = useState([]);
    const [chartData, setChartData] = useState([]);

    // Filter state
    const [startDate, setStartDate] = useState(
        format(new Date(new Date().setDate(1)), 'yyyy-MM-dd') // 1st of current month
    );
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedGuru, setSelectedGuru] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [startDate, endDate, selectedGuru]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch attendance data
            const attendanceRes = await attendanceAPI.getAll({
                start_date: startDate,
                end_date: endDate
            });

            // Fetch guru list untuk filter
            const guruRes = await userAPI.getAll();
            const gurus = guruRes.data.data || [];
            setGuruList(gurus);

            // Process rekap data
            const attendanceData = attendanceRes.data.data || [];

            // Group by user
            const grouped = {};
            gurus.forEach(g => {
                const isTeacher = g.roles?.name?.toLowerCase() === 'guru' || g.roles?.name?.toLowerCase() === 'teacher';
                if (isTeacher) {
                    grouped[g.id] = {
                        user: g,
                        hadir: 0,
                        terlambat: 0,
                        tidak_hadir: 0,
                        izin: 0,
                        sakit: 0,
                        alpha: 0,
                        total: 0
                    };
                }
            });

            attendanceData.forEach(record => {
                const userId = record.user_id;
                if (grouped[userId]) {
                    grouped[userId].total++;
                    const st = record.status?.toLowerCase();
                    if (st === 'hadir') grouped[userId].hadir++;
                    else if (st === 'terlambat') grouped[userId].terlambat++;
                    else if (st === 'tidak_hadir') grouped[userId].tidak_hadir++;
                    else if (st === 'izin') grouped[userId].izin++;
                    else if (st === 'sakit') grouped[userId].sakit++;
                    else if (st === 'alpha') grouped[userId].alpha++;
                }
            });

            const rekapArray = Object.values(grouped).map(g => {
                const totalKerja = g.hadir + g.terlambat + g.tidak_hadir + g.izin + g.sakit + g.alpha;
                const kehadiran = g.hadir + g.terlambat;
                const persentase = totalKerja > 0 ? Math.round((kehadiran / totalKerja) * 100) : 0;
                return {
                    ...g,
                    persentaseKehadiran: persentase,
                    totalHariKerja: totalKerja
                };
            });

            // Filter by selected guru
            let filteredRekap = rekapArray;
            if (selectedGuru !== 'all') {
                filteredRekap = rekapArray.filter(r => r.user.id === selectedGuru);
            }

            setRekapData(filteredRekap);

            // Prepare chart data
            const chartDataArr = filteredRekap.map(r => ({
                name: r.user.full_name?.split(',')[0] || r.user.full_name,
                Hadir: r.hadir,
                Terlambat: r.terlambat,
                'Tidak Hadir': r.tidak_hadir
            }));
            setChartData(chartDataArr);

        } catch (error) {
            toast.error('Gagal memuat data rekap');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Summary stats
    const totalHadir = rekapData.reduce((sum, r) => sum + r.hadir, 0);
    const totalTerlambat = rekapData.reduce((sum, r) => sum + r.terlambat, 0);
    const totalTidakHadir = rekapData.reduce((sum, r) => sum + r.tidak_hadir, 0);
    const avgKehadiran = rekapData.length > 0
        ? Math.round(rekapData.reduce((sum, r) => sum + r.persentaseKehadiran, 0) / rekapData.length)
        : 0;

    const filteredRekap = rekapData.filter(r =>
        r.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user.nip?.includes(searchTerm)
    );

    // Export to CSV
    const exportCSV = () => {
        const headers = ['Nama', 'NIP', 'Hadir', 'Terlambat', 'Tidak Hadir', 'Izin', 'Sakit', 'Alpha', 'Persentase Kehadiran'];
        const rows = filteredRekap.map(r => [
            r.user.full_name,
            r.user.nip || '-',
            r.hadir,
            r.terlambat,
            r.tidak_hadir,
            r.izin,
            r.sakit,
            r.alpha,
            `${r.persentaseKehadiran}%`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `rekap-absensi-${startDate}-sampai-${endDate}.csv`;
        link.click();
        toast.success('Export CSV berhasil!');
    };

    // Export to PDF
    const exportPDF = () => {
        try {
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

            // Add Kop Surat Image Header
            try {
                doc.addImage(kopImg, 'PNG', 14, 6, 269, 34);
            } catch (imgErr) {
                console.error('Error adding kop-surat image to PDF:', imgErr);
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('SMA AL-HIDAYAH PUSPAHIANG', 148, 15, { align: 'center' });
            }

            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('LAPORAN REKAPITULASI KEHADIRAN GURU', 148.5, 45, { align: 'center' });

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            const periodStr = `Periode: ${format(parseISO(startDate), 'd MMMM yyyy', { locale: localeId })} - ${format(parseISO(endDate), 'd MMMM yyyy', { locale: localeId })}`;
            doc.text(periodStr, 148.5, 50, { align: 'center' });

            doc.setLineWidth(0.4);
            doc.line(14, 53, 283, 53);

            // Table Data
            const tableData = filteredRekap.map((r, index) => [
                index + 1,
                r.user.full_name || '-',
                r.user.nip || '-',
                r.hadir || 0,
                r.terlambat || 0,
                r.tidak_hadir || 0,
                r.izin || 0,
                r.sakit || 0,
                r.alpha || 0,
                `${r.persentaseKehadiran || 0}%`
            ]);

            autoTable(doc, {
                startY: 56,
                head: [['No', 'Nama Guru', 'NIP', 'Hadir', 'Terlambat', 'Tidak Hadir', 'Izin', 'Sakit', 'Alpha', '% Hadir']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', halign: 'center' },
                bodyStyles: { fontSize: 9, textColor: [15, 23, 42] },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 12 },
                    1: { cellWidth: 65 },
                    2: { halign: 'center', cellWidth: 45 },
                    3: { halign: 'center', cellWidth: 20 },
                    4: { halign: 'center', cellWidth: 22 },
                    5: { halign: 'center', cellWidth: 24 },
                    6: { halign: 'center', cellWidth: 18 },
                    7: { halign: 'center', cellWidth: 18 },
                    8: { halign: 'center', cellWidth: 18 },
                    9: { halign: 'center', fontStyle: 'bold', cellWidth: 25 }
                }
            });

            const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 100) + 10;

            // Summary
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(`Total Guru: ${filteredRekap.length} Orang`, 14, finalY);
            doc.text(`Total Hadir: ${totalHadir} | Total Terlambat: ${totalTerlambat} | Total Tidak Hadir: ${totalTidakHadir}`, 14, finalY + 6);
            doc.text(`Rata-rata Kehadiran: ${avgKehadiran}%`, 14, finalY + 12);

            // Signature
            const sigY = finalY + 10;
            if (sigY < 175) {
                doc.setFont('helvetica', 'normal');
                doc.text('Mengetahui,', 220, sigY);
                doc.text('Kepala Sekolah SMA Al-Hidayah Puspahiang', 220, sigY + 5);
                doc.text('( ................................................ )', 220, sigY + 25);
            }

            doc.save(`rekap-absensi-guru-${startDate}-sampai-${endDate}.pdf`);
            toast.success('File PDF Laporan berhasil diunduh!');
        } catch (error) {
            console.error('Export PDF error:', error);
            toast.error('Gagal membuat PDF. Silakan coba lagi.');
        }
    };

    // Print
    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-900 text-white print:bg-white print:text-black">
                <AdminSidebar />
                <div className="flex-1 lg:ml-64 flex items-center justify-center min-h-screen print:ml-0">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-900 font-sans text-slate-100 print:bg-white print:text-black overflow-x-hidden">
            <AdminSidebar />
            <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 w-full max-w-full overflow-x-hidden print:ml-0 print:p-0 print:w-full">
                {/* Printable School Header (Only visible on window.print()) */}
                <div className="hidden print:block mb-4 text-center">
                    <img src={kopImg} alt="Kop Surat SMA Al-Hidayah Puspahiang" className="w-full h-auto mb-3" />
                    <h2 className="text-base font-bold text-black uppercase tracking-wider">LAPORAN REKAPITULASI KEHADIRAN GURU</h2>
                    <p className="text-xs text-gray-700 mt-1">
                        Periode: {format(parseISO(startDate), 'd MMMM yyyy', { locale: localeId })} — {format(parseISO(endDate), 'd MMMM yyyy', { locale: localeId })}
                    </p>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Rekap & Laporan Absensi</h1>
                        <p className="text-slate-400 text-sm mt-1">Laporan kehadiran guru dan statistik kedisiplinan per periode</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                        >
                            <FileText className="w-4 h-4" />
                            <span>Export CSV</span>
                        </button>
                        <button
                            onClick={exportPDF}
                            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium text-xs shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export PDF</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium text-xs transition-all cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak</span>
                        </button>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-8 shadow-xl print:hidden">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                        {/* Date Range Picker */}
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2">
                            <Calendar className="w-4 h-4 text-blue-400 shrink-0 ml-2" />
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent text-white text-xs px-2 py-1 outline-none border-none cursor-pointer"
                                />
                                <span className="text-slate-500 text-xs font-semibold">s/d</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent text-white text-xs px-2 py-1 outline-none border-none cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Guru Filter Select */}
                        <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 flex-1">
                            <Filter className="w-4 h-4 text-amber-400 shrink-0" />
                            <select
                                value={selectedGuru}
                                onChange={(e) => setSelectedGuru(e.target.value)}
                                className="w-full bg-slate-900 text-white text-xs outline-none border-none cursor-pointer"
                            >
                                <option value="all" className="bg-slate-900 text-white">Semua Guru</option>
                                {guruList
                                    .filter(g => g.roles?.name?.toLowerCase() === 'guru' || g.roles?.name?.toLowerCase() === 'teacher')
                                    .map(g => (
                                        <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                                            {g.full_name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Search Bar Input */}
                        <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 flex-1">
                            <Search className="w-4 h-4 text-slate-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Cari nama guru atau NIP..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-slate-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Summary Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 print:hidden">
                    {/* Total Guru */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Guru</span>
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">{filteredRekap.length}</span>
                            <span className="text-xs text-slate-400">Orang</span>
                        </div>
                    </div>

                    {/* Total Hadir */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Hadir</span>
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-emerald-400">{totalHadir}</span>
                            <span className="text-xs text-slate-400">Kali</span>
                        </div>
                    </div>

                    {/* Total Terlambat */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Terlambat</span>
                            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-amber-400">{totalTerlambat}</span>
                            <span className="text-xs text-slate-400">Kali</span>
                        </div>
                    </div>

                    {/* Rata-Rata Kehadiran */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rata-Rata Kehadiran</span>
                            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-indigo-400">{avgKehadiran}%</span>
                            <span className="text-xs text-slate-400">Persentase</span>
                        </div>
                    </div>
                </div>

                {/* Bar Chart Visualization */}
                {chartData.length > 0 && (
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8 print:hidden">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-bold text-white">Visualisasi Kehadiran Guru</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Perbandingan jumlah Hadir, Terlambat, dan Tidak Hadir</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Bar dataKey="Hadir" fill="#10b981" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="Terlambat" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="Tidak Hadir" fill="#ef4444" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Rekap Table */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden print:border-none print:shadow-none print:bg-white">
                    <div className="p-6 border-b border-slate-800/80 flex items-center justify-between print:hidden">
                        <div>
                            <h3 className="text-base font-bold text-white">Tabel Rekap Kehadiran</h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Periode: {format(parseISO(startDate), 'd MMMM yyyy', { locale: localeId })} — {format(parseISO(endDate), 'd MMMM yyyy', { locale: localeId })}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse print:text-black">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider print:bg-gray-100 print:text-black">
                                    <th className="py-3.5 px-5 print:py-2 print:px-3">No</th>
                                    <th className="py-3.5 px-5 print:py-2 print:px-3">Nama Guru</th>
                                    <th className="py-3.5 px-5 print:py-2 print:px-3">NIP</th>
                                    <th className="py-3.5 px-5 text-center text-emerald-400 print:text-black print:py-2 print:px-3">Hadir</th>
                                    <th className="py-3.5 px-5 text-center text-amber-400 print:text-black print:py-2 print:px-3">Terlambat</th>
                                    <th className="py-3.5 px-5 text-center text-rose-400 print:text-black print:py-2 print:px-3">Tidak Hadir</th>
                                    <th className="py-3.5 px-5 text-center print:py-2 print:px-3">Izin</th>
                                    <th className="py-3.5 px-5 text-center print:py-2 print:px-3">Sakit</th>
                                    <th className="py-3.5 px-5 text-center print:py-2 print:px-3">Alpha</th>
                                    <th className="py-3.5 px-5 text-center print:py-2 print:px-3">% Kehadiran</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300 print:divide-gray-300 print:text-black">
                                {filteredRekap.length > 0 ? (
                                    filteredRekap.map((record, index) => (
                                        <tr key={record.user.id} className="hover:bg-slate-900/40 transition-colors">
                                            <td className="py-4 px-5 text-slate-400 print:text-black print:py-2 print:px-3">{index + 1}</td>
                                            <td className="py-4 px-5 print:py-2 print:px-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-semibold text-white shrink-0 print:hidden">
                                                        {record.user.full_name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white text-sm print:text-black print:text-xs">{record.user.full_name}</p>
                                                        <p className="text-slate-500 text-[11px] print:hidden">{record.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-5 text-slate-300 font-mono print:text-black print:py-2 print:px-3">{record.user.nip || '-'}</td>
                                            <td className="py-4 px-5 text-center print:py-2 print:px-3">
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold print:bg-transparent print:text-black">
                                                    {record.hadir}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-center print:py-2 print:px-3">
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 font-bold print:bg-transparent print:text-black">
                                                    {record.terlambat}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-center print:py-2 print:px-3">
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 font-bold print:bg-transparent print:text-black">
                                                    {record.tidak_hadir}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-center text-slate-400 print:text-black print:py-2 print:px-3">{record.izin}</td>
                                            <td className="py-4 px-5 text-center text-slate-400 print:text-black print:py-2 print:px-3">{record.sakit}</td>
                                            <td className="py-4 px-5 text-center text-slate-400 print:text-black print:py-2 print:px-3">{record.alpha}</td>
                                            <td className="py-4 px-5 text-center print:py-2 print:px-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden print:hidden">
                                                        <div
                                                            className={`h-2 rounded-full ${record.persentaseKehadiran >= 80 ? 'bg-emerald-500' :
                                                                record.persentaseKehadiran >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                                                }`}
                                                            style={{ width: `${record.persentaseKehadiran}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`font-bold text-xs ${record.persentaseKehadiran >= 80 ? 'text-emerald-400' :
                                                        record.persentaseKehadiran >= 60 ? 'text-amber-400' : 'text-rose-400'
                                                        } print:text-black`}>
                                                        {record.persentaseKehadiran}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="py-8 text-center text-slate-500 print:text-black">
                                            Tidak ada data rekap absensi untuk periode ini
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {filteredRekap.length > 0 && (
                                <tfoot className="bg-slate-900/80 border-t-2 border-slate-800 text-xs font-bold text-white print:bg-gray-100 print:text-black print:border-black">
                                    <tr>
                                        <td colSpan="3" className="py-4 px-5 uppercase tracking-wider text-slate-400 print:text-black print:py-2 print:px-3">TOTAL SELURUH GURU</td>
                                        <td className="py-4 px-5 text-center text-emerald-400 print:text-black print:py-2 print:px-3">{totalHadir}</td>
                                        <td className="py-4 px-5 text-center text-amber-400 print:text-black print:py-2 print:px-3">{totalTerlambat}</td>
                                        <td className="py-4 px-5 text-center text-rose-400 print:text-black print:py-2 print:px-3">{totalTidakHadir}</td>
                                        <td className="py-4 px-5 text-center text-slate-300 print:text-black print:py-2 print:px-3">
                                            {filteredRekap.reduce((sum, r) => sum + r.izin, 0)}
                                        </td>
                                        <td className="py-4 px-5 text-center text-slate-300 print:text-black print:py-2 print:px-3">
                                            {filteredRekap.reduce((sum, r) => sum + r.sakit, 0)}
                                        </td>
                                        <td className="py-4 px-5 text-center text-slate-300 print:text-black print:py-2 print:px-3">
                                            {filteredRekap.reduce((sum, r) => sum + r.alpha, 0)}
                                        </td>
                                        <td className="py-4 px-5 text-center text-indigo-400 font-extrabold print:text-black print:py-2 print:px-3">{avgKehadiran}%</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>

                {/* Printable Signature Footer (Only visible on window.print()) */}
                <div className="hidden print:flex justify-between items-end mt-12 text-xs text-black">
                    <div>
                        <p>Dicetak pada: {format(new Date(), 'd MMMM yyyy HH:mm', { locale: localeId })} WIB</p>
                        <p>Sistem Informasi Absensi Guru — SMA Al-Hidayah Puspahiang</p>
                    </div>
                    <div className="text-center w-64">
                        <p>Mengetahui,</p>
                        <p className="font-semibold mb-16">Kepala Sekolah SMA Al-Hidayah Puspahiang</p>
                        <p className="font-bold underline">( ................................................ )</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RekapLaporan;