import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, redirectTo = '/login' }) => {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('ProtectedRoute - loading:', loading, 'isAuthenticated:', isAuthenticated, 'user:', user);

  // Show nothing while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If route requires authentication and user is not authenticated, redirect
  if (requireAuth && !isAuthenticated) {
    console.log('Not authenticated, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // If route requires no authentication (like login page) and user is authenticated, redirect to profile
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
