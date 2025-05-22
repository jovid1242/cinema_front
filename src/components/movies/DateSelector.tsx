import React from 'react';
import { Typography } from 'antd';
import dayjs from 'dayjs';
import './DateSelector.css';

const { Title } = Typography;

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

    const formatWeekday = (date: string) => {
        return dayjs(date).format('dd');
    };

    return (
        <div className="date-selector-container">
            <Title level={5} className="date-selector-title">Выберите дату сеанса:</Title>
            <div className="date-radio-group">
                {dates.map((date) => (
                    <button 
                        key={date} 
                        className={`date-radio-button ${selectedDate === date ? 'date-radio-button-active' : ''}`}
                        onClick={() => onDateSelect(date)}
                    >
                        <div className="date-button-content"> 
                            <div className="date-day">{formatDate(date)}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}; 