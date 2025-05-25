import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Row, Col, Typography, Space, Button, message, Card, Statistic, Spin } from 'antd';
import { ClockCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { sessions } from '../api/client';
import { HallLayout } from '../components/hall/HallLayout';
import type { Seat, Session } from '../types';

const { Title } = Typography;

const RESERVATION_TIME = 30 * 60;

interface ApiSeat {
    row_number: number;
    seat_number: number;
    is_available: boolean;
}

export const SeatSelectionPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [timeLeft, setTimeLeft] = useState<number>(RESERVATION_TIME);

    const { data: sessionData, isLoading: isLoadingSession } = useQuery({
        queryKey: ['session', sessionId],
        queryFn: () => sessions.getById(Number(sessionId)),
    });

    const { data: seatsData, isLoading: isLoadingSeats } = useQuery({
        queryKey: ['seats', sessionId],
        queryFn: () => sessions.getSeats(Number(sessionId)),
    });

    const session = useMemo<Session | null>(() => {
        if (!sessionData?.data) return null;
        if (typeof sessionData.data === 'object' && 'session' in sessionData.data) {
            return sessionData.data.session as Session;
        }
        return sessionData.data as Session;
    }, [sessionData]);

    const seats = useMemo<Seat[]>(() => {
        if (!seatsData?.data) return [];
        
        try {
            if (typeof seatsData.data === 'object' && 'seats' in seatsData.data) {
                const rawSeats = seatsData.data.seats;
                
                if (Array.isArray(rawSeats)) { 
                    return rawSeats.map((rawSeat: unknown): Seat => {
                        const apiSeat = rawSeat as ApiSeat;
                        
                        if ('row_number' in apiSeat && 'seat_number' in apiSeat) {
                            const status: 'available' | 'sold' = apiSeat.is_available ? 'available' : 'sold';
                            
                            return {
                                row: apiSeat.row_number,
                                seat: apiSeat.seat_number,
                                status
                            };
                        }
                        
                        const seatData = rawSeat as Seat;
                        return seatData;
                    });
                }
            }
        } catch (error) {
            console.error('Error processing seats data:', error);
        }
        
        return [] as Seat[];
    }, [seatsData]);

    const reserveMutation = useMutation({
        mutationFn: (seats: Seat[]) => 
            Promise.all(seats.map(seat => 
                sessions.reserveSeat(Number(sessionId), seat.row, seat.seat)
            )),
        onSuccess: () => {
            message.success('Места успешно забронированы');
            navigate('/profile');
        },
        onError: () => {
            message.error('Ошибка при бронировании мест');
        },
    });

    useEffect(() => {
        if (selectedSeats.length > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 0) {
                        clearInterval(timer);
                        setSelectedSeats([]);
                        message.warning('Время бронирования истекло');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [selectedSeats]);

    const handleSeatSelect = (row: number, seat: number) => {
        const seatData = seats.find(s => s.row === row && s.seat === seat);
        if (seatData && seatData.status !== 'available') {
            message.error('Это место недоступно для бронирования');
            return;
        }
        
        setSelectedSeats((prev) => {
            const seatIndex = prev.findIndex(s => s.row === row && s.seat === seat);
            if (seatIndex === -1) {
                return [...prev, { row, seat, status: 'available' }];
            }
            return prev.filter((_, index) => index !== seatIndex);
        });
    };

    const handleReserve = () => {
        if (selectedSeats.length === 0) {
            message.warning('Выберите хотя бы одно место');
            return;
        }
        reserveMutation.mutate(selectedSeats);
    };
 
    if (isLoadingSession || isLoadingSeats) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Spin size="large" tip="Загрузка данных..." />
            </div>
        );
    }
 
    if (!session) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <Title level={3}>Сеанс не найден</Title>
                <Button type="primary" onClick={() => navigate('/')}>Вернуться на главную</Button>
            </div>
        );
    }
 
    const totalPrice = selectedSeats.length * (session.price || 0);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card>
                    <Row gutter={24} align="middle">
                        <Col xs={24} md={12}>
                            <Title level={4}>{session.movie?.title || 'Фильм'}</Title>
                            <Space>
                                <ClockCircleOutlined /> {new Date(session.start_time).toLocaleTimeString('ru-RU', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Space>
                        </Col>
                        <Col xs={24} md={12}>
                            <Space>
                                <Statistic
                                    title="Выбрано мест"
                                    value={selectedSeats.length}
                                    suffix={`/ ${session.price || 0} ₽`}
                                />
                                <Statistic
                                    title="Итого"
                                    value={totalPrice}
                                    suffix="₽"
                                />
                                {selectedSeats.length > 0 && (
                                    <Statistic
                                        title="Осталось времени"
                                        value={formatTime(timeLeft)}
                                        valueStyle={{ color: timeLeft < 60 ? '#ff4d4f' : undefined }}
                                    />
                                )}
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {session.hall && seats.length > 0 ? (
                <HallLayout
                    hall={session.hall}
                    seats={seats}
                    selectedSeats={selectedSeats}
                    onSeatSelect={handleSeatSelect}
                />
                ) : (
                    <Card>
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <p>Информация о зале или местах недоступна</p>
                        </div>
                    </Card>
                )}

                <div style={{ textAlign: 'center' }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<ShoppingCartOutlined />}
                        onClick={handleReserve}
                        loading={reserveMutation.isPending}
                        disabled={selectedSeats.length === 0 || timeLeft === 0}
                    >
                        Забронировать места
                    </Button>
                </div>
            </Space>
        </div>
    );
}; 
