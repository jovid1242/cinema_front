import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, Typography, Space, message, Empty } from 'antd';
import { tickets } from '../api/client';
import { TicketCard } from '../components/tickets/TicketCard';
import type { Ticket } from '../types';

const { Title } = Typography;

type TicketStatus = Ticket['status'];

export const ProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TicketStatus>('reserved');
    const queryClient = useQueryClient();

    const { data: ticketsData } = useQuery({
        queryKey: ['tickets'],
        queryFn: () => tickets.getAll(),
    });

    // Правильно обрабатываем данные билетов, учитывая разные форматы API
    const ticketsList = useMemo<Ticket[]>(() => {
        if (!ticketsData?.data) return [];
        // Проверяем, есть ли свойство data в ticketsData.data (пагинация)
        if (ticketsData?.data && typeof ticketsData.data === 'object' && 'data' in ticketsData.data) {
            return (ticketsData.data.data || []) as Ticket[];
        }
        // Иначе возвращаем данные как есть (старый формат)
        return Array.isArray(ticketsData.data) ? ticketsData.data : [];
    }, [ticketsData]);

    const payMutation = useMutation({
        mutationFn: (ticketId: number) => tickets.update(ticketId, 'paid'),
        onSuccess: () => {
            message.success('Билет успешно оплачен');
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
        onError: () => {
            message.error('Ошибка при оплате билета');
        },
    });

    const cancelMutation = useMutation({
        mutationFn: (ticketId: number) => tickets.update(ticketId, 'cancelled'),
        onSuccess: () => {
            message.success('Бронирование отменено');
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
        onError: () => {
            message.error('Ошибка при отмене бронирования');
        },
    });

    const handlePay = (ticketId: number) => {
        payMutation.mutate(ticketId);
    };

    const handleCancel = (ticketId: number) => {
        cancelMutation.mutate(ticketId);
    };

    const filteredTickets = ticketsList.filter(ticket => ticket.status === activeTab);

    const renderTickets = (tickets: Ticket[]) => {
        if (tickets.length === 0) {
            return <Empty description="Нет билетов" />;
        }
        
        return (
            <Space direction="vertical" style={{ width: '100%' }}>
                {tickets.map(ticket => (
                    <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onPay={activeTab === 'reserved' ? handlePay : undefined}
                        onCancel={activeTab === 'reserved' ? handleCancel : undefined}
                    />
                ))}
            </Space>
        );
    };

    const items = [
        {
            key: 'reserved',
            label: 'Забронированные',
            children: renderTickets(filteredTickets),
        },
        {
            key: 'paid',
            label: 'Оплаченные',
            children: renderTickets(filteredTickets),
        },
        {
            key: 'cancelled',
            label: 'Отмененные',
            children: renderTickets(filteredTickets),
        },
    ];

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Title level={2}>Мои билеты</Title>
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => setActiveTab(key as TicketStatus)}
                    items={items}
                />
            </Space>
        </div>
    );
}; 