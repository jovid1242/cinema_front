import React from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd/es/button';

// Определяем тип для статусов места
type SeatStatus = 'available' | 'sold' | 'reserved';

interface SeatProps {
    row: number;
    seat: number;
    status: SeatStatus;
    isSelected: boolean;
    onSelect: (row: number, seat: number) => void;
}

export const Seat: React.FC<SeatProps> = ({
    row,
    seat,
    status,
    isSelected,
    onSelect,
}) => {
    // Определяем стиль для проданных мест
    const soldSeatStyle: React.CSSProperties = {
        backgroundColor: '#ff4d4f',
        borderColor: '#ff4d4f',
        color: '#fff'
    };

    // Определяем стиль для забронированных мест
    const reservedSeatStyle: React.CSSProperties = {
        backgroundColor: '#faad14',
        borderColor: '#faad14',
        color: '#fff'
    };

    const getButtonProps = (): ButtonProps & { style?: React.CSSProperties } => {
        switch (status) {
            case 'available':
                return {
                    type: isSelected ? 'primary' : 'default',
                    danger: false,
                };
            case 'sold':
                return {
                    type: 'default',
                    danger: true,
                    style: soldSeatStyle,
                };
            case 'reserved':
                return {
                    type: 'default',
                    danger: false,
                    style: reservedSeatStyle,
                };
            default:
                return {
                    type: 'default',
                    danger: false,
                };
        }
    };

    // Все недоступные места считаем занятыми
    const isDisabled = status === 'sold' || status === 'reserved';
    const buttonProps = getButtonProps();

    return (
        <Button
            {...buttonProps}
            disabled={isDisabled}
            onClick={() => !isDisabled && onSelect(row, seat)}
            style={{
                width: 40,
                height: 40,
                padding: 0,
                margin: 4,
                borderRadius: 4,
                ...(buttonProps.style || {}),
            }}
        >
            {seat}
        </Button>
    );
};