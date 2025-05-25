import React from 'react';
import { Card, Space, Typography, Button, Tag } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { Ticket } from '../../types';
import './TicketCard.css';

const { Text, Title } = Typography;

interface TicketCardProps {
    ticket: Ticket;
    onPay?: (ticketId: number) => void;
    onCancel?: (ticketId: number) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onPay, onCancel }) => {
    const getStatusTag = () => {
        switch (ticket.status) {
            case 'reserved':
                return (
                    <Tag icon={<ClockCircleOutlined />} color="warning">
                        Забронирован
                    </Tag>
                );
            case 'paid':
                return (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                        Оплачен
                    </Tag>
                );
            case 'cancelled':
                return (
                    <Tag icon={<CloseCircleOutlined />} color="error">
                        Отменен
                    </Tag>
                );
            case 'expired':
                return (
                    <Tag icon={<CloseCircleOutlined />} color="default">
                        Истек срок
                    </Tag>
                );
            default:
                return null;
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card className="ticket-card">
            <Space direction="vertical" className="ticket-card-content">
                <div className="ticket-header">
                    <Space direction="vertical" className="ticket-info">
                        <Title level={4}>{ticket.session?.movie?.title}</Title>
                        <Space>
                            <ClockCircleOutlined />
                            <Text>
                                {formatDateTime(ticket.session?.start_time || '')}
                            </Text>
                        </Space>
                        <Text>
                            Зал: {ticket.session?.hall?.name}, Ряд: {ticket.row}, Место: {ticket.seat}
                        </Text>
                    </Space>
                    <Space direction="vertical" align="end" className="ticket-actions">
                        {getStatusTag()}
                        <Text strong>{ticket.price} ₽</Text>
                        {ticket.status === 'reserved' && (
                            <Space>
                                <Button type="primary" onClick={() => onPay?.(ticket.id)}>
                                    Оплатить
                                </Button>
                                <Button danger onClick={() => onCancel?.(ticket.id)}>
                                    Отменить
                                </Button>
                            </Space>
                        )}
                    </Space>
                </div>
                {ticket.reserved_until && ticket.status === 'reserved' && (
                    <Text type="secondary">
                        Бронь действительна до: {formatDateTime(ticket.reserved_until)}
                    </Text>
                )}
                {ticket.paid_at && (
                    <Text type="secondary">
                        Оплачен: {formatDateTime(ticket.paid_at)}
                    </Text>
                )}
            </Space>
        </Card>
    );
}; 
