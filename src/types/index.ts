export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
}

export interface Movie {
    id: number;
    title: string;
    description: string;
    duration_minutes: number;
    duration?: number;
    director: string;
    genre: string;
    release_year: number;
    poster_url: string;
    is_active: boolean;
    rating?: number;
}

export interface Hall {
    id: number;
    name: string;
    rows: number;
    seats_per_row: number;
}

export interface Session {
    id: number;
    start_time: string;
    end_time: string;
    price: number;
    hall: Hall;
    movie?: Movie;
}

export type SeatStatus = 'available' | 'reserved' | 'sold';

export interface Seat {
    row: number;
    seat: number;
    status: SeatStatus;
}

export interface Ticket {
    id: number;
    session_id: number;
    user_id: number;
    row: number;
    seat: number;
    status: 'reserved' | 'paid' | 'cancelled' | 'expired';
    price: number;
    reserved_until?: string;
    paid_at?: string;
    session?: Session;
}

export interface AuthResponse {
    status: string;
    data: {
        user: User;
        token: string;
    };
}

export interface ApiResponse<T> {
    status: string;
    data: T;
}

export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    total: number;
    per_page: number;
} 