import axios from 'axios';
import type { ApiResponse, User, Movie, Session, Ticket, Seat, PaginatedResponse, Hall, SessionFormValues } from '../types';

const API_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Перехватчик для добавления токена
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Перехватчик для обработки ошибок
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const auth = {
    login: async (email: string, password: string) => {
        const response = await apiClient.post<{
            access_token: string;
            token_type: string;
            expires_in: number;
            user: User;
        }>('/auth/login', {
            email,
            password,
        });
        console.log('Login response:', response.data);
        return response.data;
    },

    register: async (name: string, email: string, password: string, password_confirmation: string) => {
        const response = await apiClient.post<{
            access_token: string;
            token_type: string;
            expires_in: number;
            user: User;
        }>('/auth/register', {
            name,
            email,
            password,
            password_confirmation,
        });
        return response.data;
    },

    logout: async () => {
        const response = await apiClient.post<ApiResponse<null>>('/auth/logout');
        return response.data;
    },

    me: async () => {
        // Пробуем несколько возможных URL и форматов ответа
        try {
            console.log('Trying to fetch user data...');
            // Пробуем сначала /auth/me, который может вернуть пользователя напрямую
            const response = await apiClient.get<User>('/auth/get_me');
            console.log('User data response from /auth/me:', response.data);
            
            // Если ответ - это объект пользователя, возвращаем его в формате { data: User }
            if (response.data && typeof response.data === 'object') {
                return { data: response.data as User };
            }
            throw new Error('Unexpected response format');
        } catch (error) {
            console.error('Error with /auth/me, trying alternative URL...', error);
            try {
                // Пробуем альтернативный путь /auth/get_me, который может вернуть обертку ApiResponse
                const response = await apiClient.get<ApiResponse<User>>('/auth/get_me');
                console.log('Alternative URL response from /auth/get_me:', response.data);
                
                // Если ответ содержит data, возвращаем его
                if (response.data && response.data.data) {
                    return response.data;
                }
                throw new Error('Unexpected response format');
            } catch (error) {
                console.error('Trying with pure token without URL path...', error);
                try {
                    // В некоторых API, можно получить данные пользователя просто отправив токен
                    const response = await apiClient.get<User>('/user');
                    console.log('User response from /user:', response.data);
                    return { data: response.data as User };
                } catch (userError) {
                    console.error('All attempts to fetch user data failed', userError);
                    throw userError;
                }
            }
        }
    },
};

export const movies = {
    getAll: async (params?: { search?: string; genre?: string; year?: number; sort_by?: string; sort_order?: 'asc' | 'desc' }) => {
        const response = await apiClient.get<ApiResponse<PaginatedResponse<Movie>>>('/movies', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<ApiResponse<Movie & { grouped_sessions: Record<string, Session[]> }>>(`/movies/${id}`);
        return response.data;
    },

    create: async (data: Omit<Movie, 'id'>) => {
        const response = await apiClient.post<ApiResponse<Movie>>('/movies', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Omit<Movie, 'id'>>) => {
        const response = await apiClient.put<ApiResponse<Movie>>(`/movies/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete<ApiResponse<null>>(`/movies/${id}`);
        return response.data;
    },
};

export const sessions = {
    getAll: async () => {
        const response = await apiClient.get<ApiResponse<Session[]>>('/sessions');
        return response.data;
    },

    getByMovieId: async (movieId: number) => {
        const response = await apiClient.get<ApiResponse<Session[]>>(`/movies/${movieId}/sessions`);
        return response.data;
    },

    getById: async (sessionId: number) => {
        const response = await apiClient.get<ApiResponse<Session>>(`/sessions/${sessionId}`);
        return response.data;
    },

    create: async (data: SessionFormValues) => {
        const response = await apiClient.post<ApiResponse<Session>>('/sessions', data);
        return response.data;
    },

    update: async (id: number, data: Partial<SessionFormValues>) => {
        const response = await apiClient.put<ApiResponse<Session>>(`/sessions/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete<ApiResponse<null>>(`/sessions/${id}`);
        return response.data;
    },

    getSeats: async (sessionId: number) => {
        const response = await apiClient.get<ApiResponse<{ session: Session; seats: Seat[] }>>(`/sessions/${sessionId}/seats`);
        return response.data;
    },

    reserveSeat: async (sessionId: number, row: number, seat: number) => {
        const response = await apiClient.post<ApiResponse<Ticket>>('/tickets', {
            session_id: sessionId,
            row_number: row,
            seat_number: seat,
        });
        return response.data;
    },

    payTicket: async (ticketId: number) => {
        const response = await apiClient.put<ApiResponse<Ticket>>(`/tickets/${ticketId}`, {
            status: 'paid',
        });
        return response.data;
    },

    cancelTicket: async (ticketId: number) => {
        const response = await apiClient.put<ApiResponse<Ticket>>(`/tickets/${ticketId}`, {
            status: 'cancelled',
        });
        return response.data;
    },
};

export const tickets = {
    create: async (sessionId: number, row: number, seat: number) => {
        const response = await apiClient.post<ApiResponse<Ticket>>('/tickets', {
            session_id: sessionId,
            row_number: row,
            seat_number: seat,
        });
        return response.data;
    },

    update: async (id: number, status: 'paid' | 'cancelled') => {
        const response = await apiClient.put<ApiResponse<Ticket>>(`/tickets/${id}`, { status });
        return response.data;
    },

    getAll: async () => {
        const response = await apiClient.get<ApiResponse<Ticket[]>>('/tickets');
        return response.data;
    },
};

export const halls = {
    getAll: async () => {
        const response = await apiClient.get<ApiResponse<Hall[]>>('/halls');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<ApiResponse<Hall>>(`/halls/${id}`);
        return response.data;
    },

    create: async (data: Omit<Hall, 'id'>) => {
        const response = await apiClient.post<ApiResponse<Hall>>('/halls', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Omit<Hall, 'id'>>) => {
        const response = await apiClient.put<ApiResponse<Hall>>(`/halls/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete<ApiResponse<null>>(`/halls/${id}`);
        return response.data;
    },
};

export const users = {
    getAll: async () => {
        const response = await apiClient.get<ApiResponse<User[]>>('/users');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
        return response.data;
    },

    update: async (id: number, data: Partial<Omit<User, 'id'>>) => {
        const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete<ApiResponse<null>>(`/users/${id}`);
        return response.data;
    },
};

export const statistics = {
    getOverview: async () => {
        const response = await apiClient.get<ApiResponse<{
            total_users: number;
            total_movies: number;
            total_sessions: number;
            total_tickets: number;
            total_revenue: number;
            tickets_by_status: {
                reserved: number;
                paid: number;
                cancelled: number;
                expired: number;
            };
        }>>('/statistics/overview');
        return response.data;
    },

    getRevenueByDate: async (startDate: string, endDate: string) => {
        const response = await apiClient.get<ApiResponse<{
            date: string;
            revenue: number;
            tickets_count: number;
        }[]>>('/statistics/revenue', {
            params: { start_date: startDate, end_date: endDate }
        });
        return response.data;
    },

    getTopMovies: async (startDate: string, endDate: string) => {
        const response = await apiClient.get<ApiResponse<{
            movie_id: number;
            movie_title: string;
            tickets_count: number;
            revenue: number;
        }[]>>('/statistics/top-movies', {
            params: { start_date: startDate, end_date: endDate }
        });
        return response.data;
    },

    getAttendanceByHall: async (startDate: string, endDate: string) => {
        const response = await apiClient.get<ApiResponse<{
            hall_id: number;
            hall_name: string;
            sessions_count: number;
            tickets_count: number;
            revenue: number;
        }[]>>('/statistics/attendance-by-hall', {
            params: { start_date: startDate, end_date: endDate }
        });
        return response.data;
    }
};

export default apiClient; 