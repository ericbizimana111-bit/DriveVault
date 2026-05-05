
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--primary)',
        color: 'white', fontFamily: 'Sora, sans-serif', fontSize: '1.1rem'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'driver') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
