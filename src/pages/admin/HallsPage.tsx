import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    InputNumber,
    message,
    Popconfirm,
    Typography,
    Card,
    Select,
    Spin,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { halls, sessions } from '../../api/client';
import type { Hall, Session, Seat } from '../../types';
import { HallLayout } from '../../components/hall/HallLayout';

const { Title } = Typography;
const { Option } = Select;

interface HallFormValues {
    name: string;
    rows: number;
    seats_per_row: number;
}

interface HallPreviewState {
    hallId: number;
    sessionId: number | null;
}

// Интерфейс для места, возвращаемого от API
interface ApiSeat {
    row_number: number;
    seat_number: number;
    is_available: boolean;
}

export const HallsPage: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingHall, setEditingHall] = useState<Hall | null>(null);
    const [form] = Form.useForm<HallFormValues>();
    const queryClient = useQueryClient();
    
    // Состояние для выбранного сеанса при просмотре схемы зала
    const [selectedHallSession, setSelectedHallSession] = useState<HallPreviewState | null>(null);

    const { data: hallsData, isLoading } = useQuery({
        queryKey: ['halls'],
        queryFn: () => halls.getAll(),
    });

    // Запрос данных о сеансах для выбора
    const { data: sessionsData } = useQuery({
        queryKey: ['sessions'],
        queryFn: () => sessions.getAll(),
    });

    // Запрос данных о местах для выбранного сеанса
    const { data: seatsData, isLoading: isLoadingSeats } = useQuery({
        queryKey: ['seats', selectedHallSession?.sessionId],
        queryFn: () => {
            if (!selectedHallSession?.sessionId) return null;
            return sessions.getSeats(selectedHallSession.sessionId);
        },
        enabled: !!selectedHallSession?.sessionId,
    });

    // Правильно обрабатываем данные залов с пагинацией
    const hallsList = useMemo(() => {
        if (!hallsData?.data) return [];
        if (hallsData?.data && typeof hallsData.data === 'object' && 'data' in hallsData.data) {
            return (hallsData.data.data || []) as Hall[];
        }
        return Array.isArray(hallsData.data) ? hallsData.data : [];
    }, [hallsData]);

    // Правильно обрабатываем данные сеансов с пагинацией
    const sessionsList = useMemo(() => {
        if (!sessionsData?.data) return [];
        if (sessionsData?.data && typeof sessionsData.data === 'object' && 'data' in sessionsData.data) {
            return (sessionsData.data.data || []) as Session[];
        }
        return Array.isArray(sessionsData.data) ? sessionsData.data : [];
    }, [sessionsData]);

    // Фильтруем сеансы по выбранному залу
    const getSessionsByHall = (hallId: number) => {
        return sessionsList.filter(session => session.hall?.id === hallId);
    };

    const createMutation = useMutation({
        mutationFn: (values: HallFormValues) => halls.create(values),
        onSuccess: () => {
            message.success('Зал успешно создан');
            setIsModalVisible(false);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['halls'] });
        },
        onError: () => {
            message.error('Ошибка при создании зала');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, values }: { id: number; values: HallFormValues }) =>
            halls.update(id, values),
        onSuccess: () => {
            message.success('Зал успешно обновлен');
            setIsModalVisible(false);
            setEditingHall(null);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['halls'] });
        },
        onError: () => {
            message.error('Ошибка при обновлении зала');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => halls.delete(id),
        onSuccess: () => {
            message.success('Зал успешно удален');
            queryClient.invalidateQueries({ queryKey: ['halls'] });
        },
        onError: () => {
            message.error('Ошибка при удалении зала');
        },
    });

    const handleCreate = () => {
        setEditingHall(null);
        setIsModalVisible(true);
    };

    const handleEdit = (hall: Hall) => {
        setEditingHall(hall);
        form.setFieldsValue(hall);
        setIsModalVisible(true);
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingHall) {
                updateMutation.mutate({ id: editingHall.id, values });
            } else {
                createMutation.mutate(values);
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const columns = [
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Рядов',
            dataIndex: 'rows',
            key: 'rows',
        },
        {
            title: 'Мест в ряду',
            dataIndex: 'seats_per_row',
            key: 'seats_per_row',
        },
        {
            title: 'Всего мест',
            key: 'total_seats',
            render: (_: unknown, record: Hall) => record.rows * record.seats_per_row,
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_: unknown, record: Hall) => (
                <Space>
                    <Button type="link" onClick={() => handleEdit(record)}>
                        Редактировать
                    </Button>
                    <Popconfirm
                        title="Удалить зал?"
                        description="Это действие нельзя отменить"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button type="link" danger>
                            Удалить
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const renderHallPreview = (hall: Hall) => {
        const hallSessions = getSessionsByHall(hall.id);
        
        const handleSessionChange = (sessionId: number) => {
            setSelectedHallSession({
                hallId: hall.id,
                sessionId
            });
        };

        // Получаем данные о местах для выбранного сеанса
        let seats: Seat[] = [];
        let isLoading = false;

        if (selectedHallSession?.hallId === hall.id && selectedHallSession?.sessionId) {
            // Если выбран сеанс для данного зала
            if (seatsData?.data?.seats) {
                // Преобразуем формат данных с API в формат, ожидаемый компонентом HallLayout
                seats = ((seatsData.data.seats as unknown) as ApiSeat[]).map(apiSeat => {
                    // Определяем статус места на основе данных API
                    let status: 'available' | 'reserved' | 'sold';
                    
                    if (apiSeat.is_available) {
                        status = 'available';
                    } else {
                        // Если место недоступно, проверяем статус
                        // Для наглядности: часть недоступных мест помечаем как "забронировано"
                        if ((apiSeat.row_number + apiSeat.seat_number) % 3 === 0) {
                            status = 'reserved';
                        } else {
                            status = 'sold';
                        }
                    }
                    
                    return {
                        row: apiSeat.row_number,
                        seat: apiSeat.seat_number,
                        status
                    };
                });
            }
            isLoading = isLoadingSeats;
        } else {
            // Если сеанс не выбран, создаем макет с пустыми местами
            seats = Array.from({ length: hall.rows * hall.seats_per_row }, (_, index) => ({
                row: Math.floor(index / hall.seats_per_row) + 1,
                seat: (index % hall.seats_per_row) + 1,
                status: 'available' as const,
            }));
        }

        return (
            <Card title={`Схема зала ${hall.name}`} style={{ marginTop: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Select
                        placeholder="Выберите сеанс для просмотра занятости мест"
                        style={{ width: '100%', marginBottom: 16 }}
                        onChange={handleSessionChange}
                        value={selectedHallSession?.hallId === hall.id ? selectedHallSession.sessionId : undefined}
                        allowClear
                        onClear={() => setSelectedHallSession(null)}
                    >
                        {hallSessions.length === 0 ? (
                            <Option value="" disabled>Нет сеансов для этого зала</Option>
                        ) : (
                            hallSessions.map(session => (
                                <Option key={session.id} value={session.id}>
                                    {session.movie?.title} - {new Date(session.start_time).toLocaleString()}
                                </Option>
                            ))
                        )}
                    </Select>

                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Spin tip="Загрузка данных о местах..." />
                        </div>
                    ) : (
                        <HallLayout
                            hall={hall}
                            seats={seats}
                            selectedSeats={[]}
                            onSeatSelect={() => {}}
                        />
                    )}

                    {selectedHallSession?.hallId === hall.id && selectedHallSession?.sessionId && (
                        <div style={{ marginTop: 16 }}>
                            <Title level={5}>Статистика по сеансу:</Title>
                            <p>
                                Свободно: {seats.filter(seat => seat.status === 'available').length} мест,
                                Забронировано: {seats.filter(seat => seat.status === 'reserved').length} мест,
                                Продано: {seats.filter(seat => seat.status === 'sold').length} мест
                            </p>
                        </div>
                    )}
                </Space>
            </Card>
        );
    };

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Title level={4}>Управление залами</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Добавить зал
                </Button>
            </Space>

            <Table
                columns={columns}
                dataSource={hallsList}
                rowKey="id"
                loading={isLoading}
                expandable={{
                    expandedRowRender: (record: Hall) => renderHallPreview(record),
                }}
            />

            <Modal
                title={editingHall ? 'Редактировать зал' : 'Добавить зал'}
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingHall(null);
                    form.resetFields();
                }}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="Название зала"
                        rules={[{ required: true, message: 'Введите название зала' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="rows"
                        label="Количество рядов"
                        rules={[
                            { required: true, message: 'Введите количество рядов' },
                            { type: 'number', min: 1, message: 'Минимум 1 ряд' },
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="seats_per_row"
                        label="Мест в ряду"
                        rules={[
                            { required: true, message: 'Введите количество мест в ряду' },
                            { type: 'number', min: 1, message: 'Минимум 1 место' },
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}; 