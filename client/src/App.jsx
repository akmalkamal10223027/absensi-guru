import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import DataGuru from './pages/admin/DataGuru';
import Absensi from './pages/admin/Absensi';
import RekapLaporan from './pages/admin/RekapLaporan';
import JamKerja from './pages/admin/JamKerja';
import LokasiSekolah from './pages/admin/LokasiSekolah';
import Pengaturan from './pages/admin/Pengaturan';
import Akun from './pages/admin/Akun';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CheckIn from './pages/teacher/CheckIn';
import CheckOut from './pages/teacher/CheckOut';
import Riwayat from './pages/teacher/Riwayat';
import Profil from './pages/teacher/Profil';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/data-guru"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DataGuru />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/absensi"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Absensi />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rekap-laporan"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <RekapLaporan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jam-kerja"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <JamKerja />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/lokasi-sekolah" element={
            <ProtectedRoute allowedRoles={['admin']}><LokasiSekolah /></ProtectedRoute>
          } />

          <Route path="/admin/pengaturan" element={
            <ProtectedRoute allowedRoles={['admin']}><Pengaturan /></ProtectedRoute>
          } />

          <Route path="/admin/akun" element={
            <ProtectedRoute allowedRoles={['admin']}><Akun /></ProtectedRoute>
          } />

          {/* Teacher Routes */}
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedRoles={['guru']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/check-in"
            element={
              <ProtectedRoute allowedRoles={['guru']}>
                <CheckIn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/absen-masuk"
            element={
              <ProtectedRoute allowedRoles={['guru']}>
                <CheckIn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/check-out"
            element={
              <ProtectedRoute allowedRoles={['guru']}>
                <CheckOut />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/absen-pulang"
            element={
              <ProtectedRoute allowedRoles={['guru']}>
                <CheckOut />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/riwayat"
            element={
              <ProtectedRoute allowedRoles={['guru']}>
                <Riwayat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/profil"
            element={
              <ProtectedRoute allowedRoles={['guru']}>
                <Profil />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;