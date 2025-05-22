import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Typography, Tag, Space, Spin, message, Divider } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { movies } from '../api/client';
import { DateSelector } from '../components/movies/DateSelector';
import { SessionList } from '../components/movies/SessionList';
import type { Movie, Session, ApiResponse } from '../types';

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
        onSettled: (data: any) => {
            if (data?.data.grouped_sessions) {
                const dates = Object.keys(data.data.grouped_sessions);
                if (dates.length > 0 && !selectedDate) {
                    setSelectedDate(dates[0]);
                }
            }
        },
    });

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
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
            <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                    <img
                        src={movie.poster_url || 'https://via.placeholder.com/300x450?text=Нет+постера'}
                        alt={movie.title}
                        style={{ width: '100%', borderRadius: 8 }}
                    />
                </Col>
                <Col xs={24} md={16}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div>
                            <Title level={2}>{movie.title}</Title>
                            <Space size="middle">
                                <Tag color="blue">{movie.genre}</Tag>
                                <Tag color="green">{movie.release_year}</Tag>
                                <Space>
                                    <ClockCircleOutlined /> {movie.duration_minutes} мин.
                                </Space>
                            </Space>
                        </div>

                        <Paragraph>{movie.description}</Paragraph>

                        <Divider />

                        <div>
                            <Title level={4}>Расписание сеансов</Title>
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <DateSelector
                                    dates={dates}
                                    selectedDate={selectedDate}
                                    onDateSelect={setSelectedDate}
                                />
                                <SessionList
                                    sessions={sessions}
                                    selectedDate={selectedDate}
                                />
                            </Space>
                        </div>
                    </Space>
                </Col>
            </Row>
        </div>
    );
}; 