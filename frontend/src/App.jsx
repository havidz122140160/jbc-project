// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages & Components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import KapsterDashboard from './pages/KapsterDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ReservationPage from './pages/ReservationPage';
import QueueDetails from './pages/QueueDetails';
import BookedPage from './pages/BookedPage';
import { useNotifications } from './hooks/useNotifications';

// --- PINDAHKAN KE SINI (DI LUAR APP) ---
const Settings = () => <div className="p-8 text-center">Halaman Pengaturan (Hanya untuk Owner)</div>;

const DynamicDashboard = () => {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role');

  // SKENARIO 1: Nggak ada token = Pelanggan Umum
  if (!token) {
    return <Dashboard />; 
  }

  // SKENARIO 2: Ada token, cek Role-nya
  if (role === 'owner') {
    return <OwnerDashboard />;
  } else if (role === 'kapster') {
    return <KapsterDashboard />;
  }

  // Default balik ke Dashboard Pelanggan
  return <Dashboard />;
};

const App = () => {
  useNotifications();

  return (
    <Router>
      <Routes>
        {/* Rute Publik: Bisa diakses siapa aja tanpa login */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/queue-details" element={<QueueDetails />} />
        <Route path="/booked" element={<BookedPage />} />

        {/* Rute Hybrid: Tampilannya beda-beda tergantung siapa yang buka */}        <Route path="/dashboard" element={<DynamicDashboard />} />

        {/* Rute Khusus: Bener-bener cuma buat yang udah login (Opsional) */}
        <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;