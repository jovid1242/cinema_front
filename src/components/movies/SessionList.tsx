import React from 'react';
import { Card, Tag, Space, Typography } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { Session } from '../../types';

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

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Text strong>Сеансы на {new Date(selectedDate).toLocaleDateString('ru-RU')}</Text>
            <Space wrap>
                {sessions.map((session) => (
                    <Link 
                        key={session.id} 
                        to={`/sessions/${session.id}/seats`}
                        style={{ textDecoration: 'none' }}
                    >
                        <Card hoverable size="small">
                            <Space>
                                <ClockCircleOutlined /> {formatTime(session.start_time)}
                                <EnvironmentOutlined /> {session.hall.name}
                                <Tag color="blue">{session.price} ₽</Tag>
                            </Space>
                        </Card>
                    </Link>
                ))}
            </Space>
            {sessions.length === 0 && (
                <Text type="secondary">На выбранную дату сеансов нет</Text>
            )}
        </Space>
    );
}; 