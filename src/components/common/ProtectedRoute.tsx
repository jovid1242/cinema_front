import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from './LoadingScreen';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    const hasToken = localStorage.getItem('token') !== null;

    if (loading) {
        return <LoadingScreen tip="Загрузка данных..." />;
    }

    if (!user && !hasToken) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user && hasToken) {
        return <LoadingScreen tip="Проверка авторизации..." />;
    }

    if (requireAdmin && user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
