import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Spaces from './pages/Spaces';
import NewReservation from './pages/NewReservation';
import MyReservations from './pages/MyReservations';
import Admin from './pages/Admin';
import AdminUsers from './pages/AdminUsers';
import AdminSpaces from './pages/AdminSpaces';
import './index.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === 'ADMIN' ? children : <Navigate to="/espacos" />;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/espacos" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/espacos" element={<Spaces />} />
        <Route path="/espacos/:id/reservar" element={<PrivateRoute><NewReservation /></PrivateRoute>} />
        <Route path="/minhas-reservas" element={<PrivateRoute><MyReservations /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/admin/moradores" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/espacos" element={<AdminRoute><AdminSpaces /></AdminRoute>} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
