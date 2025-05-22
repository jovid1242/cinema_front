import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Select,
    InputNumber,
    DatePicker,
    message,
    Popconfirm,
    Typography,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { sessions, movies, halls } from '../../api/client';
import type { Session, SessionFormValues, Movie, Hall } from '../../types';

const { Title } = Typography;
const { Option } = Select;

interface SessionFormData extends Omit<SessionFormValues, 'start_time'> {
    start_time: Dayjs;
}

export const SessionsPage: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [form] = Form.useForm<SessionFormData>();
    const queryClient = useQueryClient();

    const { data: sessionsData, isLoading: isSessionsLoading } = useQuery({
        queryKey: ['sessions'],
        queryFn: () => sessions.getAll(),
    });

    const { data: moviesData, isLoading: isMoviesLoading } = useQuery({
        queryKey: ['movies'],
        queryFn: () => movies.getAll(),
    });

    const { data: hallsData, isLoading: isHallsLoading } = useQuery({
        queryKey: ['halls'],
        queryFn: () => halls.getAll(),
    });
 

    const createMutation = useMutation({
        mutationFn: (values: SessionFormValues) => sessions.create(values),
        onSuccess: () => {
            message.success('Сеанс успешно создан');
            setIsModalVisible(false);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        },
        onError: () => {
            message.error('Ошибка при создании сеанса');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, values }: { id: number; values: SessionFormValues }) =>
            sessions.update(id, values),
        onSuccess: () => {
            message.success('Сеанс успешно обновлен');
            setIsModalVisible(false);
            setEditingSession(null);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        },
        onError: () => {
            message.error('Ошибка при обновлении сеанса');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => sessions.delete(id),
        onSuccess: () => {
            message.success('Сеанс успешно удален');
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        },
        onError: () => {
            message.error('Ошибка при удалении сеанса');
        },
    });

    const handleCreate = () => {
        setEditingSession(null);
        setIsModalVisible(true);
    };

    const handleEdit = (session: Session) => {
        setEditingSession(session);
        const [date, time] = session.start_time.split(' ');
        form.setFieldsValue({
            ...session,
            start_time: dayjs(`${date}T${time}`),
        });
        setIsModalVisible(true);
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const formattedValues: SessionFormValues = {
                ...values,
                start_time: values.start_time.format('YYYY-MM-DD HH:mm:ss'),
            };

            if (editingSession) {
                updateMutation.mutate({ id: editingSession.id, values: formattedValues });
            } else {
                createMutation.mutate(formattedValues);
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    // Правильно обрабатываем данные сеансов, учитывая разные форматы API
    const sessionsList = useMemo(() => {
        if (!sessionsData?.data) return [];
        // Проверяем, есть ли свойство data в sessionsData.data (пагинация)
        if (sessionsData?.data && typeof sessionsData.data === 'object' && 'data' in sessionsData.data) {
            return (sessionsData.data.data || []) as Session[];
        }
        // Иначе возвращаем данные как есть (старый формат)
        return Array.isArray(sessionsData.data) ? sessionsData.data : [];
    }, [sessionsData]);
    
    // Правильно обрабатываем данные залов, учитывая разные форматы API
    const hallsList = useMemo(() => {
        if (!hallsData?.data) return [];
        // Проверяем, есть ли свойство data в hallsData.data (пагинация)
        if (hallsData?.data && typeof hallsData.data === 'object' && 'data' in hallsData.data) {
            return (hallsData.data.data || []) as Hall[];
        }
        // Иначе возвращаем данные как есть (старый формат)
        return Array.isArray(hallsData.data) ? hallsData.data : [];
    }, [hallsData]);
    
    // Правильно обрабатываем данные фильмов, учитывая разные форматы API
    const moviesList = useMemo(() => {
        if (!moviesData?.data) return [];
        // Проверяем, есть ли свойство data в moviesData.data (пагинация)
        if (moviesData?.data && typeof moviesData.data === 'object' && 'data' in moviesData.data) {
            return (moviesData.data.data || []) as Movie[];
        }
        // Иначе возвращаем данные как есть (старый формат)
        return Array.isArray(moviesData.data) ? moviesData.data : [];
    }, [moviesData]);

    const columns = [
        {
            title: 'Фильм',
            dataIndex: ['movie', 'title'],
            key: 'movie',
        },
        {
            title: 'Зал',
            dataIndex: ['hall', 'name'],
            key: 'hall',
        },
        {
            title: 'Время начала',
            dataIndex: 'start_time',
            key: 'start_time',
            render: (time: string) => dayjs(time).format('DD.MM.YYYY HH:mm'),
        },
        {
            title: 'Время окончания',
            dataIndex: 'end_time',
            key: 'end_time',
            render: (time: string) => dayjs(time).format('DD.MM.YYYY HH:mm'),
        },
        {
            title: 'Цена',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `${price} ₽`,
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_: unknown, record: Session) => (
                <Space>
                    <Button type="link" onClick={() => handleEdit(record)}>
                        Редактировать
                    </Button>
                    <Popconfirm
                        title="Удалить сеанс?"
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

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Title level={4}>Управление сеансами</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Добавить сеанс
                </Button>
            </Space>

            <Table
                columns={columns}
                dataSource={sessionsList}
                rowKey="id"
                loading={isSessionsLoading}
            />

            <Modal
                title={editingSession ? 'Редактировать сеанс' : 'Добавить сеанс'}
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingSession(null);
                    form.resetFields();
                }}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="movie_id"
                        label="Фильм"
                        rules={[{ required: true, message: 'Выберите фильм' }]}
                    >
                        <Select
                            loading={isMoviesLoading}
                            placeholder="Выберите фильм"
                        >
                            {moviesList.map((movie: Movie) => (
                                <Option key={movie.id} value={movie.id}>
                                    {movie.title}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="hall_id"
                        label="Зал"
                        rules={[{ required: true, message: 'Выберите зал' }]}
                    >
                        <Select
                            loading={isHallsLoading}
                            placeholder="Выберите зал"
                        >
                            {hallsList.map((hall: Hall) => (
                                <Option key={hall.id} value={hall.id}>
                                    {hall.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="start_time"
                        label="Дата и время начала"
                        rules={[{ required: true, message: 'Выберите дату и время' }]}
                    >
                        <DatePicker
                            showTime
                            format="DD.MM.YYYY HH:mm"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Цена билета"
                        rules={[
                            { required: true, message: 'Введите цену билета' },
                            { type: 'number', min: 0, message: 'Цена не может быть отрицательной' },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) => `${value} ₽`}
                            parser={(value) => value!.replace(' ₽', '')}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}; 