import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Typography, Tag, Space, Spin, message, Divider, Rate } from 'antd';
import { ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { movies } from '../api/client';
import { DateSelector } from '../components/movies/DateSelector';
import { SessionList } from '../components/movies/SessionList';
import type { Movie, Session, ApiResponse } from '../types';
import './MovieDetailsPage.css';

const { Title, Paragraph } = Typography;

interface MovieWithSessions extends Movie {
    grouped_sessions: Record<string, Session[]>;
}

export const MovieDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [selectedDate, setSelectedDate] = useState<string>('');

    const { data, isLoading, error } = useQuery<ApiResponse<MovieWithSessions>>({
        queryKey: ['movie', id],
        queryFn: () => movies.getById(Number(id)),
    });

    useEffect(() => {
        if (data?.data.grouped_sessions) {
            const dates = Object.keys(data.data.grouped_sessions);
            if (dates.length > 0 && !selectedDate) {
                setSelectedDate(dates[0]);
            }
        }
    }, [data, selectedDate]);

    if (error) {
        message.error('Ошибка при загрузке информации о фильме');
        return null;
    }

    if (isLoading || !data) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    const movie = data.data;
    const dates = Object.keys(movie.grouped_sessions);
    const sessions = selectedDate ? movie.grouped_sessions[selectedDate] : [];

    return (
        <div className="movie-details-wrapper"> 
            
            <div className="movie-details-container">
                <div className="movie-details-card">
                    <Row gutter={[40, 40]}>
                        <Col xs={24} md={8}>
                            <img
                                src={movie.poster_url || 'https://via.placeholder.com/300x450?text=Нет+постера'}
                                alt={movie.title}
                                className="movie-poster"
                            />
                        </Col>
                        <Col xs={24} md={16}>
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <div>
                                    <Title level={2} className="movie-title">{movie.title}</Title>
                                    <div className="movie-meta">
                                        <Space size="middle" wrap>
                                            <Tag color="blue" className="movie-tag">{movie.genre}</Tag>
                                            <Tag color="green" className="movie-tag">
                                                <CalendarOutlined /> {movie.release_year}
                                            </Tag>
                                            <Tag color="orange" className="movie-tag">
                                                <ClockCircleOutlined /> {movie.duration_minutes} мин.
                                            </Tag>
                                            <Rate disabled defaultValue={4.5} allowHalf />
                                        </Space>
                                    </div>

                                    <Paragraph className="movie-description">{movie.description}</Paragraph>
                                     
                                </div>

                                <Divider className="movie-divider" />

                                <div className="sessions-container">
                                    <Title level={4} className="sessions-title">Расписание сеансов</Title>
                                    <DateSelector
                                        dates={dates}
                                        selectedDate={selectedDate}
                                        onDateSelect={setSelectedDate}
                                    />
                                    <SessionList
                                        sessions={sessions}
                                        selectedDate={selectedDate}
                                    />
                                </div>
                            </Space>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    );
}; 
