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
    DatePicker,
    Switch,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { movies } from '../../api/client';
import type { Movie } from '../../types';
import axios from 'axios';

const { Title } = Typography;

interface MovieFormValues {
    title: string;
    description: string;
    duration_minutes: number;
    director: string;
    genre: string;
    release_year: number;
    release_year_date?: Dayjs;
    poster_url: string;
    is_active: boolean;
    rating?: number;
}

export const MoviesPage: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
    const [form] = Form.useForm<MovieFormValues>();
    const queryClient = useQueryClient();

    const { data: moviesData, isLoading } = useQuery({
        queryKey: ['movies'],
        queryFn: () => movies.getAll(),
    });

    const moviesList = useMemo(() => {
        if (!moviesData?.data) return [];
        if (moviesData?.data && typeof moviesData.data === 'object' && 'data' in moviesData.data) {
            return (moviesData.data.data || []) as Movie[];
        }
        return Array.isArray(moviesData.data) ? moviesData.data : [];
    }, [moviesData]);

    const createMutation = useMutation({
        mutationFn: (values: Omit<Movie, 'id'>) => movies.create(values),
        onSuccess: () => {
            message.success('Фильм успешно создан');
            setIsModalVisible(false);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['movies'] });
        },
        onError: (error: unknown) => {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Ошибка при создании фильма:', error.response.data);
            }
            message.error('Ошибка при создании фильма');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, values }: { id: number; values: Partial<Omit<Movie, 'id'>> }) =>
            movies.update(id, values),
        onSuccess: () => {
            message.success('Фильм успешно обновлен');
            setIsModalVisible(false);
            setEditingMovie(null);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['movies'] });
        },
        onError: (error: unknown) => {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Ошибка при обновлении фильма:', error.response.data);
            }
            message.error('Ошибка при обновлении фильма');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => movies.delete(id),
        onSuccess: () => {
            message.success('Фильм успешно удален');
            queryClient.invalidateQueries({ queryKey: ['movies'] });
        },
        onError: () => {
            message.error('Ошибка при удалении фильма');
        },
    });

    const handleCreate = () => {
        setEditingMovie(null);
        setIsModalVisible(true);
    };

    const handleEdit = (movie: Movie) => {
        setEditingMovie(movie);
        
        const formValues = {
            ...movie,
            duration_minutes: (movie as unknown as { duration_minutes?: number }).duration_minutes || movie.duration || 0,
            release_year_date: movie.release_year ? dayjs().year(movie.release_year) : undefined
        };
        
        form.setFieldsValue(formValues);
        setIsModalVisible(true);
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            const release_year = values.release_year_date ? values.release_year_date.year() : undefined;
            
            const movieData = {
                ...values,
                release_year,
            };
            
            delete movieData.release_year_date;
            
            if (editingMovie) {
                updateMutation.mutate({ id: editingMovie.id, values: movieData });
            } else {
                createMutation.mutate(movieData as unknown as Omit<Movie, 'id'>);
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const columns = [
        {
            title: 'Название',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Режиссер',
            dataIndex: 'director',
            key: 'director',
        },
        {
            title: 'Жанр',
            dataIndex: 'genre',
            key: 'genre',
        },
        {
            title: 'Год',
            dataIndex: 'release_year',
            key: 'release_year',
        },
        {
            title: 'Длительность',
            dataIndex: 'duration_minutes',
            key: 'duration_minutes',
            render: (_: number, record: Movie) => 
                `${(record as unknown as { duration_minutes?: number }).duration_minutes || record.duration || 0} мин.`,
        },
        {
            title: 'Рейтинг',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating?: number) => rating ? `${rating}/10` : 'Нет оценки',
        },
        {
            title: 'Статус',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive: boolean) => (
                <span style={{ color: isActive ? '#52c41a' : '#ff4d4f' }}>
                    {isActive ? 'Активен' : 'Неактивен'}
                </span>
            ),
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_: unknown, record: Movie) => (
                <Space>
                    <Button type="link" onClick={() => handleEdit(record)}>
                        Редактировать
                    </Button>
                    <Popconfirm
                        title="Удалить фильм?"
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
                <Title level={4}>Управление фильмами</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Добавить фильм
                </Button>
            </Space>

            <Table
                columns={columns}
                dataSource={moviesList}
                rowKey="id"
                loading={isLoading}
            />

            <Modal
                title={editingMovie ? 'Редактировать фильм' : 'Добавить фильм'}
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingMovie(null);
                    form.resetFields();
                }}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ is_active: true }}
                >
                    <Form.Item
                        name="title"
                        label="Название"
                        rules={[{ required: true, message: 'Введите название фильма' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Описание"
                        rules={[{ required: true, message: 'Введите описание фильма' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="director"
                        label="Режиссер"
                        rules={[{ required: true, message: 'Введите имя режиссера' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="genre"
                        label="Жанр"
                        rules={[{ required: true, message: 'Введите жанр фильма' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="release_year_date"
                        label="Год выпуска"
                        rules={[{ required: true, message: 'Выберите год выпуска' }]}
                    >
                        <DatePicker 
                            picker="year" 
                            style={{ width: '100%' }}
                            placeholder="Выберите год"
                            disabledDate={(current) => {
                                return current && (current.year() < 1900 || current.year() > new Date().getFullYear() + 5);
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="duration_minutes"
                        label="Длительность (минуты)"
                        rules={[{ required: true, message: 'Введите длительность фильма' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="rating"
                        label="Рейтинг"
                    >
                        <InputNumber min={0} max={10} step={0.1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="poster_url"
                        label="URL постера"
                        rules={[{ required: true, message: 'Введите URL постера' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="is_active"
                        label="Активен"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}; 
