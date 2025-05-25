import React, { useState } from 'react';
import { Row, Col, Spin, Empty } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { movies } from '../api/client';
import { MovieCard } from '../components/movies/MovieCard';
import { MovieFilters } from '../components/movies/MovieFilters';
import { HomeBanner } from '../components/Banner/HomeBanner';
import type { Movie } from '../types';

export const HomePage: React.FC = () => {
    const [filters, setFilters] = useState<{
        search?: string;
        genre?: string;
        year?: number;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    }>({});

    const { data, isLoading, error } = useQuery({
        queryKey: ['movies', filters],
        queryFn: () => movies.getAll({ ...filters, limit: 100 }),
    });

    const genres = Array.from(new Set(data?.data.data.map((movie: Movie) => movie.genre) || []));
    const years = Array.from(new Set(data?.data.data.map((movie: Movie) => movie.release_year) || []))
        .sort((a, b) => b - a);

    const handleFilter = (values: typeof filters) => {
        setFilters(values);
    };

    if (error) {
        console.error('Ошибка при загрузке фильмов:', error);
        const isAuthError = 
            error && 
            typeof error === 'object' && 
            'response' in error && 
            error.response && 
            typeof error.response === 'object' && 
            'status' in error.response && 
            error.response.status === 401;
            
        if (isAuthError) {
            return (
                <div>
                    <HomeBanner />
                    <Empty 
                        description="Для просмотра фильмов необходимо авторизоваться" 
                        style={{ marginTop: 50 }}
                    />
                </div>
            );
        }
        
        return (
            <div>
                <HomeBanner />
                <Empty description="Не удалось загрузить фильмы" style={{ marginTop: 50 }} />
            </div>
        );
    }

    return (
        <div>
            <HomeBanner />
            
            <MovieFilters
                onFilter={handleFilter}
                genres={genres}
                years={years}
            />

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    <Row gutter={[24, 24]}>
                        {data?.data.data.map((movie: Movie) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={movie.id}>
                                <MovieCard movie={movie} />
                            </Col>
                        ))}
                    </Row>

                    {data?.data.data.length === 0 && (
                        <Empty description="Фильмы не найдены" />
                    )}
                </>
            )}
        </div>
    );
}; 
