import React from 'react';
import { Radio, Space } from 'antd';
import dayjs from 'dayjs';

interface DateSelectorProps {
    dates: string[];
    selectedDate: string;
    onDateSelect: (date: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
    dates,
    selectedDate,
    onDateSelect,
}) => {
    const formatDate = (date: string) => {
        const dayjsDate = dayjs(date);
        const today = dayjs();
        
        if (dayjsDate.isSame(today, 'day')) {
            return 'Сегодня';
        }
        if (dayjsDate.isSame(today.add(1, 'day'), 'day')) {
            return 'Завтра';
        }
        return dayjsDate.format('D MMMM');
    };

    return (
        <Radio.Group
            value={selectedDate}
            onChange={(e) => onDateSelect(e.target.value)}
            buttonStyle="solid"
        >
            <Space wrap>
                {dates.map((date) => (
                    <Radio.Button key={date} value={date}>
                        {formatDate(date)}
                    </Radio.Button>
                ))}
            </Space>
        </Radio.Group>
    );
}; 