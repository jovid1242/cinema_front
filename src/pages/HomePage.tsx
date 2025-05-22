import React, { useState } from 'react';
import { Row, Col, Pagination, Spin, Empty, message } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { movies } from '../api/client';
import { MovieCard } from '../components/movies/MovieCard';
import { MovieFilters } from '../components/movies/MovieFilters';
import { HomeBanner } from '../components/Banner/HomeBanner';
import type { Movie } from '../types';

const ITEMS_PER_PAGE = 12;

export const HomePage: React.FC = () => {
    const [filters, setFilters] = useState<{
        search?: string;
        genre?: string;
        year?: number;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    }>({});
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading, error } = useQuery({
        queryKey: ['movies', { ...filters, page: currentPage }],
        queryFn: () => movies.getAll({ ...filters, page: currentPage }),
    });

    // Получаем уникальные жанры и годы из всех фильмов
    const genres = Array.from(new Set(data?.data.data.map((movie: Movie) => movie.genre) || []));
    const years = Array.from(new Set(data?.data.data.map((movie: Movie) => movie.release_year) || []))
        .sort((a, b) => b - a);

    const handleFilter = (values: typeof filters) => {
        setFilters(values);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (error) {
        message.error('Ошибка при загрузке фильмов');
        return <Empty description="Не удалось загрузить фильмы" />;
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

                    {data?.data.total > ITEMS_PER_PAGE && (
                        <div style={{ textAlign: 'center', marginTop: 24 }}>
                            <Pagination
                                current={currentPage}
                                total={data.data.total}
                                pageSize={ITEMS_PER_PAGE}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                            />
                        </div>
                    )}

                    {data?.data.data.length === 0 && (
                        <Empty description="Фильмы не найдены" />
                    )}
                </>
            )}
        </div>
    );
}; 