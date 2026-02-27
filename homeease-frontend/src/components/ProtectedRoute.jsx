import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, currentUser, loading } = useAuth();
    const location = useLocation();

    // If the auth context has a loading state, we should wait
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuthenticated || !currentUser) {
        // Redirect to login but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role.toLowerCase())) {
        // If user is logged in but doesn't have the right role, 
        // redirect them to their appropriate dashboard
        const role = currentUser.role.toLowerCase();
        if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (role === 'provider') return <Navigate to="/provider/dashboard" replace />;
        return <Navigate to="/customer/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
