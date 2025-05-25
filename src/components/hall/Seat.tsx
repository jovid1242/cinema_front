import React from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd/es/button';

type SeatStatus = 'available' | 'sold';

interface SeatProps {
    row: number;
    seat: number;
    is_available: boolean;
    isSelected: boolean;
    onSelect: (row: number, seat: number) => void;
}

export const Seat: React.FC<SeatProps> = ({
    row,
    seat,
    is_available,
    isSelected,
    onSelect,
}) => {
    const status: SeatStatus = is_available ? 'available' : 'sold';

    const soldSeatStyle: React.CSSProperties = {
        backgroundColor: '#ff4d4f',
        borderColor: '#ff4d4f',
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
            default:
                return {
                    type: 'default',
                    danger: false,
                };
        }
    };

    const isDisabled = !is_available;
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
