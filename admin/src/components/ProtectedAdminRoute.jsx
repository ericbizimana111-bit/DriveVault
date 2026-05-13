import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedAdminRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white', fontFamily: 'Sora, sans-serif', fontSize: '1.1rem'
            }}>
                Loading...
            </div>
        );
    }

    if (!user) return <Navigate to="/admin/login" replace />;

    if (user.role !== 'admin') {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
}
