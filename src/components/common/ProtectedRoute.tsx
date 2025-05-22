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

    // Проверка наличия токена для избежания ненужных редиректов при перезагрузке страницы
    const hasToken = localStorage.getItem('token') !== null;

    if (loading) {
        return <LoadingScreen tip="Загрузка данных..." />;
    }

    // Перенаправляем на логин только если нет пользователя И нет токена
    if (!user && !hasToken) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Если у нас есть токен, но пользователь не загружен (возможно ошибка API или устаревший токен)
    if (!user && hasToken) {
        // Здесь мы показываем загрузку, а не делаем редирект, потому что возможно AuthContext еще не успел обработать ответ API
        return <LoadingScreen tip="Проверка авторизации..." />;
    }

    // Проверка прав администратора
    if (requireAdmin && user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};