import React from 'react';
import { Space, Typography, Card } from 'antd';
import { Seat } from './Seat';
import type { Seat as SeatType, Hall } from '../../types';

const { Text } = Typography;

interface HallLayoutProps {
    hall: Hall;
    seats: SeatType[];
    selectedSeats: SeatType[];
    onSeatSelect: (row: number, seat: number) => void;
}

export const HallLayout: React.FC<HallLayoutProps> = ({
    hall,
    seats,
    selectedSeats,
    onSeatSelect,
}) => {
    const getSeatAvailability = (row: number, seat: number): boolean => {
        const seatData = seats.find(s => s.row === row && s.seat === seat);
        return seatData?.status === 'available';
    };

    const isSeatSelected = (row: number, seat: number): boolean => {
        return selectedSeats.some(s => s.row === row && s.seat === seat);
    };

    const renderRow = (rowNumber: number) => {
        const seatsInRow = Array.from({ length: hall.seats_per_row }, (_, i) => i + 1);

        return (
            <div key={rowNumber} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <Text strong style={{ width: 30, textAlign: 'center' }}>
                    {rowNumber}
                </Text>
                <Space>
                    {seatsInRow.map(seatNumber => (
                        <Seat
                            key={`${rowNumber}-${seatNumber}`}
                            row={rowNumber}
                            seat={seatNumber}
                            is_available={getSeatAvailability(rowNumber, seatNumber)}
                            isSelected={isSeatSelected(rowNumber, seatNumber)}
                            onSelect={onSeatSelect}
                        />
                    ))}
                </Space>
            </div>
        );
    };

    return (
        <Card title={`Зал ${hall.name}`}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ 
                        width: '60%', 
                        height: 4, 
                        backgroundColor: '#d9d9d9', 
                        margin: '0 auto 24px' 
                    }} />
                    <Text type="secondary">Экран</Text>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {Array.from({ length: hall.rows }, (_, i) => i + 1).map(renderRow)}
                </div>

                <div style={{ marginTop: 24 }}>
                    <Space>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ 
                                width: 20, 
                                height: 20, 
                                backgroundColor: '#fff', 
                                border: '1px solid #d9d9d9',
                                marginRight: 8,
                                borderRadius: 4,
                            }} />
                            <Text>Свободно</Text>
                        </div> 
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ 
                                width: 20, 
                                height: 20, 
                                backgroundColor: '#ff4d4f', 
                                marginRight: 8,
                                borderRadius: 4,
                            }} />
                            <Text>Продано</Text>
                        </div>
                        
                    </Space>
                </div>
            </Space>
        </Card>
    );
}; 
