import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Statistic, Spin, Typography, Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import {
    UserOutlined,
    FileOutlined,
    CalendarOutlined,
    TagsOutlined,
    DollarOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { statistics } from '../../api/client';

const { Title } = Typography;

export const Dashboard: React.FC = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['statistics', 'overview'],
        queryFn: () => statistics.getOverview(),
    });

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <Title level={4}>Панель управления</Title>
            
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={4}>
                    <Card>
                        <Statistic
                            title="Пользователи"
                            value={data?.data.users}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card>
                        <Statistic
                            title="Фильмы"
                            value={data?.data.movies}
                            prefix={<FileOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card>
                        <Statistic
                            title="Сеансы"
                            value={data?.data.sessions}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card>
                        <Statistic
                            title="Билеты"
                            value={data?.data.tickets.total}
                            prefix={<TagsOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Общая выручка"
                            value={data?.data.revenue.total}
                            prefix={<DollarOutlined />}
                            suffix="₽"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title="Статистика билетов">
                        <Row gutter={16}>
                            <Col span={6}>
                                <Statistic
                                    title="Забронировано"
                                    value={data?.data.tickets.booked}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Оплачено"
                                    value={data?.data.tickets.paid}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Отменено"
                                    value={data?.data.tickets.canceled}
                                    valueStyle={{ color: '#ff4d4f' }}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Истекло"
                                    value={data?.data.tickets.expired}
                                    valueStyle={{ color: '#bfbfbf' }}
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title="Быстрый доступ">
                        <Space size="middle">
                            <Link to="/admin/movies">
                                <Button type="primary" icon={<FileOutlined />}>
                                    Управление фильмами
                                </Button>
                            </Link>
                            <Link to="/admin/sessions">
                                <Button type="primary" icon={<CalendarOutlined />}>
                                    Управление сеансами
                                </Button>
                            </Link>
                            <Link to="/admin/halls">
                                <Button type="primary" icon={<PlusOutlined />}>
                                    Управление залами
                                </Button>
                            </Link>
                            <Link to="/admin/users">
                                <Button type="primary" icon={<UserOutlined />}>
                                    Управление пользователями
                                </Button>
                            </Link>
                            <Link to="/admin/statistics">
                                <Button type="primary" icon={<DollarOutlined />}>
                                    Подробная статистика
                                </Button>
                            </Link>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}; 
