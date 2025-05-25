import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Card,
    Row,
    Col,
    Statistic,
    DatePicker,
    Table,
    Typography,
    Space,
    Spin,
} from 'antd';
import {
    UserOutlined,
    FileOutlined,
    CalendarOutlined,
    TagsOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import { statistics } from '../../api/client';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface TopMovie {
    movie_id: number;
    movie_title: string;
    tickets_count: number;
    revenue: number;
}

interface HallStats {
    hall_id: number;
    hall_name: string;
    sessions_count: number;
    tickets_count: number;
    revenue: number;
}

export const StatisticsPage: React.FC = () => {
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(30, 'days'),
        dayjs(),
    ]);

    const { data: overviewData, isLoading: isOverviewLoading } = useQuery({
        queryKey: ['statistics', 'overview'],
        queryFn: () => statistics.getOverview(),
    });

    const { data: revenueData, isLoading: isRevenueLoading } = useQuery({
        queryKey: ['statistics', 'revenue', dateRange],
        queryFn: () => statistics.getRevenueByDate(
            dateRange[0].format('YYYY-MM-DD'),
            dateRange[1].format('YYYY-MM-DD')
        ),
    });

    const { data: topMoviesData, isLoading: isTopMoviesLoading } = useQuery({
        queryKey: ['statistics', 'top-movies', dateRange],
        queryFn: () => statistics.getTopMovies(
            dateRange[0].format('YYYY-MM-DD'),
            dateRange[1].format('YYYY-MM-DD')
        ),
    });

    const { data: hallData, isLoading: isHallLoading } = useQuery({
        queryKey: ['statistics', 'attendance-by-hall', dateRange],
        queryFn: () => statistics.getAttendanceByHall(
            dateRange[0].format('YYYY-MM-DD'),
            dateRange[1].format('YYYY-MM-DD')
        ),
    });

    const isLoading = isOverviewLoading || isRevenueLoading || isTopMoviesLoading || isHallLoading;

    const revenueConfig = {
        data: revenueData?.data || [],
        xField: 'date',
        yField: 'revenue',
        seriesField: 'type',
        yAxis: {
            label: {
                formatter: (v: string) => `${v} ₽`,
            },
        },
        legend: false,
        smooth: true,
    };

    const ticketsByStatusConfig = {
        data: overviewData?.data
            ? [
                { type: 'Забронировано', value: overviewData.data.tickets.booked },
                { type: 'Оплачено', value: overviewData.data.tickets.paid },
                { type: 'Отменено', value: overviewData.data.tickets.canceled },
                { type: 'Истекло', value: overviewData.data.tickets.expired },
            ]
            : [],
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name} {percentage}',
        },
        interactions: [{ type: 'element-active' }],
    };

    const topMoviesColumns = [
        {
            title: 'Фильм',
            dataIndex: 'movie_title',
            key: 'movie_title',
        },
        {
            title: 'Количество билетов',
            dataIndex: 'tickets_count',
            key: 'tickets_count',
            sorter: (a: TopMovie, b: TopMovie) => a.tickets_count - b.tickets_count,
        },
        {
            title: 'Выручка',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value: number) => `${value} ₽`,
            sorter: (a: TopMovie, b: TopMovie) => a.revenue - b.revenue,
        },
    ];

    const hallColumns = [
        {
            title: 'Зал',
            dataIndex: 'hall_name',
            key: 'hall_name',
        },
        {
            title: 'Количество сеансов',
            dataIndex: 'sessions_count',
            key: 'sessions_count',
            sorter: (a: HallStats, b: HallStats) => a.sessions_count - b.sessions_count,
        },
        {
            title: 'Количество билетов',
            dataIndex: 'tickets_count',
            key: 'tickets_count',
            sorter: (a: HallStats, b: HallStats) => a.tickets_count - b.tickets_count,
        },
        {
            title: 'Выручка',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value: number) => `${value} ₽`,
            sorter: (a: HallStats, b: HallStats) => a.revenue - b.revenue,
        },
    ];

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <Space style={{ marginBottom: 24 }} align="center">
                <Title level={4}>Статистика</Title>
                <RangePicker
                    value={dateRange}
                    onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                />
            </Space>

            <Row gutter={[16, 16]}>
                <Col span={4}>
                    <Card>
                        <Statistic
                            title="Пользователи"
                            value={overviewData?.data.users}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card>
                        <Statistic
                            title="Фильмы"
                            value={overviewData?.data.movies}
                            prefix={<FileOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card>
                        <Statistic
                            title="Сеансы"
                            value={overviewData?.data.sessions}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card>
                        <Statistic
                            title="Билеты"
                            value={overviewData?.data.tickets.total}
                            prefix={<TagsOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Общая выручка"
                            value={overviewData?.data.revenue.total}
                            prefix={<DollarOutlined />}
                            suffix="₽"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={16}>
                    <Card title="Динамика выручки">
                        <Line {...revenueConfig} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Статусы билетов">
                        <Pie {...ticketsByStatusConfig} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={12}>
                    <Card title="Топ фильмов">
                        <Table
                            columns={topMoviesColumns}
                            dataSource={topMoviesData?.data}
                            rowKey="movie_id"
                            pagination={false}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Статистика по залам">
                        <Table
                            columns={hallColumns}
                            dataSource={hallData?.data}
                            rowKey="hall_id"
                            pagination={false}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}; 
