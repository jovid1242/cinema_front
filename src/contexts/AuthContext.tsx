import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import { auth } from '../api/client';
import type { User } from '../types';

interface LoginResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: User;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<LoginResponse>;
    register: (name: string, email: string, password: string, password_confirmation: string) => Promise<LoginResponse>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const updateUser = (userData: User | null) => {
        setUser(userData);
        if (userData) {
            localStorage.setItem('userData', JSON.stringify(userData));
        } else {
            localStorage.removeItem('userData');
        }
    };

    const fetchUserData = async (maxRetries = 2, retryCount = 0) => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setLoading(false);
            return;
        }

        const cachedUser = localStorage.getItem('userData');
        if (cachedUser) {
            try {
                const userData = JSON.parse(cachedUser) as User;
                console.log('Using cached user data:', userData);
                setUser(userData);
                setLoading(false); // Устанавливаем loading в false, так как у нас есть кэшированные данные
                
                if (!isRefreshing) {
                    fetchUserDataFromApi(maxRetries, retryCount).catch(console.error);
                }
                return;
            } catch (e) {
                console.error('Error parsing cached user data:', e);
                localStorage.removeItem('userData');
            }
        }
        
        try {
            await fetchUserDataFromApi(maxRetries, retryCount);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDataFromApi = async (maxRetries = 2, retryCount = 0) => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        try {
            const response = await auth.me();
            console.log('Response in context:', response);
            
            let userData: User | null = null;
            
            if (response && typeof response === 'object') {
                if ('data' in response && response.data && typeof response.data === 'object') {
                    if ('id' in response.data && 'email' in response.data && 'name' in response.data && 'role' in response.data) {
                        userData = response.data as User;
                    }
                } else if ('user' in response && response.user && typeof response.user === 'object') {
                    if ('id' in response.user && 'email' in response.user && 'name' in response.user && 'role' in response.user) {
                        userData = response.user as User;
                    }
                } else if ('id' in response && 'email' in response && 'name' in response && 'role' in response) {
                    userData = response as unknown as User;
                }
            }
            
            if (userData) {
                console.log('User data extracted:', userData);
                updateUser(userData);
            } else {
                console.error('Could not extract user data from response:', response);
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
            }
        } catch (error: unknown) {
            console.error('Error fetching user data:', error);
            
            const isAuthError = 
                error && 
                typeof error === 'object' && 
                'response' in error && 
                error.response && 
                typeof error.response === 'object' && 
                'status' in error.response && 
                error.response.status === 401;
                
            if (isAuthError) {
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
            }
            else if (retryCount < maxRetries) {
                setTimeout(() => {
                    setIsRefreshing(false); // Сбрасываем флаг перед повторной попыткой
                    fetchUserDataFromApi(maxRetries, retryCount + 1);
                }, 1000 * (retryCount + 1)); // 1s, затем 2s задержка
                return;
            }
            throw error;
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const login = async (email: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await auth.login(email, password);
            localStorage.setItem('token', response.access_token);
            
            if (response.user) {
                updateUser(response.user);
            }
            
            return response;
        } catch (error) {
            console.error('Login error:', error);
            message.error('Ошибка входа в систему. Проверьте ваши учетные данные.');
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string, password_confirmation: string): Promise<LoginResponse> => {
        try {
            const response = await auth.register(name, email, password, password_confirmation);
            localStorage.setItem('token', response.access_token);
            
            if (response.user) {
                updateUser(response.user);
            }
            
            return response;
        } catch (error) {
            console.error('Registration error:', error);
            message.error('Ошибка регистрации. Пожалуйста, проверьте введенные данные.');
            throw error;
        }
    };

    const logout = async () => {
        try {
            await auth.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            updateUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 
