import React from 'react';
import { Tag, Typography } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { Session } from '../../types';
import './SessionList.css';

const { Text } = Typography;

interface SessionListProps {
    sessions: Session[];
    selectedDate: string;
}

export const SessionList: React.FC<SessionListProps> = ({ sessions, selectedDate }) => {
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long'
        });
    };

    return (
        <div>
            <Text strong className="session-date-title">
                Сеансы на {formatDate(selectedDate)}
            </Text>
            
            {sessions.length > 0 ? (
                <div className="sessions-grid">
                    {sessions.map((session) => (
                        <Link 
                            key={session.id} 
                            to={`/sessions/${session.id}/seats`}
                            style={{ textDecoration: 'none' }}
                        >
                            <div className="session-card">
                                <div className="session-card-content">
                                    <div className="session-time">
                                        <ClockCircleOutlined style={{ marginRight: 8 }} /> 
                                        {formatTime(session.start_time)}
                                    </div>
                                    <div className="session-hall">
                                        <EnvironmentOutlined style={{ marginRight: 8 }} /> 
                                        Зал {session.hall?.name}
                                    </div>
                                    <div className="session-price">
                                        <Tag color="blue" className="session-price-tag">
                                            {session.price} ₽
                                        </Tag>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="no-sessions-message">
                    На выбранную дату сеансов нет
                </div>
            )}
        </div>
    );
}; 