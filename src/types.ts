export interface User {
    id: number;
    email: string;
    name: string;
    role: string;
}

export interface Movie {
    id: number;
    title: string;
    description: string;
    duration_minutes: number;
    duration?: number;
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
    movie_id: number;
    hall_id: number;
    start_time: string;
    end_time: string;
    price: number;
    movie?: Movie;
    hall?: Hall;
}

export interface Seat {
    row: number;
    seat: number;
    status: 'available' | 'reserved' | 'sold';
}

export interface ApiSeat {
    row_number: number;
    seat_number: number;
    is_available: boolean;
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

export interface ApiResponse<T> {
    status: 'success' | 'error';
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    total: number;
    per_page: number;
}

export interface SessionFormValues {
    movie_id: number;
    hall_id: number;
    start_time: string;
    price: number;
} 
