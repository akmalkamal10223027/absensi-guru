import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    if (allowedRoles) {
        const rawRole = String(user.role || '').toLowerCase();
        const isAllowed = allowedRoles.some(r => {
            const targetRole = r.toLowerCase();
            if (targetRole === 'admin') {
                return rawRole.includes('admin');
            }
            if (targetRole === 'guru' || targetRole === 'teacher') {
                return rawRole.includes('guru') || rawRole.includes('teacher');
            }
            return rawRole === targetRole;
        });

        if (!isAllowed) {
            console.warn(`Access denied for user role '${user.role}' on route with allowed roles:`, allowedRoles);
            return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;