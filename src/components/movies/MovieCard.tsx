import React from 'react';
import { Card, Tag, Space } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { Movie } from '../../types';

interface MovieCardProps {
    movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
    return (
        <Link to={`/movies/${movie.id}`}>
            <Card
                hoverable
                className="movie-card"
                cover={
                    <img
                        alt={movie.title}
                        src={movie.poster_url || 'https://via.placeholder.com/300x450?text=Нет+постера'}
                    />
                }
            >
                <Card.Meta
                    title={movie.title}
                    description={
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space>
                                <Tag color="blue">{movie.genre}</Tag>
                                <Tag color="green">{movie.release_year}</Tag>
                            </Space>
                            <Space>
                                <ClockCircleOutlined /> {movie.duration_minutes} мин.
                            </Space>
                            <div style={{ marginTop: 8 }}>
                                {movie.description.length > 100
                                    ? `${movie.description.substring(0, 100)}...`
                                    : movie.description}
                            </div>
                        </Space>
                    }
                />
            </Card>
        </Link>
    );
}; 