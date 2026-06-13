import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, role }) {
  const { user, role: userRole, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
  </div>;

  if (!user) return <Navigate to={role === 'admin' ? '/admin/login' : '/student-login'} />;
  if (userRole !== role) return <Navigate to="/" />;

  return children;
}

export default ProtectedRoute;
