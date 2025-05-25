import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Layout } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { HomePage } from './pages/HomePage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';
import { ProfilePage } from './pages/ProfilePage';
import { MoviesPage } from './pages/admin/MoviesPage';
import { HallsPage } from './pages/admin/HallsPage';
import { SessionsPage } from './pages/admin/SessionsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { StatisticsPage } from './pages/admin/StatisticsPage';
import { Dashboard } from './components/admin/Dashboard';
import { useEffect } from 'react';

const { Content } = Layout;

const Login = () => (
    <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <LoginForm />
        </Content>
    </Layout>
);

const Register = () => (
    <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <RegisterForm />
        </Content>
    </Layout>
);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const AdminRoutes = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/admin' && user?.role === 'admin') {
            const lastPath = localStorage.getItem('lastAdminPath');
            if (lastPath && lastPath !== '/admin') {
                navigate(lastPath, { replace: true });
            }
        }
    }, [location.pathname, user, navigate]);

    if (user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <AdminLayout />;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ConfigProvider locale={ruRU}>
                <AuthProvider>
                    <Router>
                        <Routes>
                            {}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {}
                            <Route
                                path="/"
                                element={
                                    <MainLayout>
                                        <HomePage />
                                    </MainLayout>
                                }
                            />
                            <Route
                                path="/movies/:id"
                                element={
                                    <MainLayout>
                                        <MovieDetailsPage />
                                    </MainLayout>
                                }
                            />
                            <Route
                                path="/sessions/:sessionId/seats"
                                element={
                                    <ProtectedRoute>
                                        <MainLayout>
                                            <SeatSelectionPage />
                                        </MainLayout>
                                    </ProtectedRoute>
                                }
                            />
  
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <MainLayout>
                                            <ProfilePage />
                                        </MainLayout>
                                    </ProtectedRoute>
                                }
                            />
 
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute requireAdmin>
                                        <AdminRoutes />
                                    </ProtectedRoute>
                                }
                            >
                                <Route index element={<Dashboard />} />
                                <Route path="movies" element={<MoviesPage />} />
                                <Route path="halls" element={<HallsPage />} />
                                <Route path="sessions" element={<SessionsPage />} />
                                <Route path="users" element={<UsersPage />} />
                                <Route path="statistics" element={<StatisticsPage />} />
                            </Route>

                            {}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Router>
                </AuthProvider>
            </ConfigProvider>
        </QueryClientProvider>
    );
}

export default App;
