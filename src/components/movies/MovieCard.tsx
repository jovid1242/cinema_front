import React from 'react';
import { Card, Tag, Space } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { Movie } from '../../types';
import './MovieCard.css';

interface MovieCardProps {
    movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
    return (
        <Link to={`/movies/${movie.id}`} className="movie-card-link">
            <Card
                hoverable
                className="movie-card"
                cover={
                    <div className="movie-poster-container">
                        <img
                            alt={movie.title}
                            src={movie.poster_url || 'https://via.placeholder.com/300x450?text=Нет+постера'}
                            className="movie-poster"
                        />
                        <div className="movie-poster-overlay">
                            <div className="movie-quick-info">
                                <div className="movie-rating">{movie.rating || '8.5'}</div>
                            </div>
                        </div>
                    </div>
                }
            >
                <Card.Meta
                    title={<div className="movie-title">{movie.title}</div>}
                    description={
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space className="movie-tags">
                                <Tag color="blue">{movie.genre}</Tag>
                                <Tag color="green">{movie.release_year}</Tag>
                            </Space>
                            <Space className="movie-duration">
                                <ClockCircleOutlined /> {movie.duration_minutes} мин.
                            </Space>
                            <div className="movie-description">
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
