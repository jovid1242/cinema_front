import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    message,
    Popconfirm,
    Typography,
    Tag,
    Select,
} from 'antd';
import { users } from '../../api/client';
import type { User } from '../../types';

const { Title } = Typography;
const { Option } = Select;

interface UserFormValues {
    name: string;
    email: string;
    role: string;
}

export const UsersPage: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [form] = Form.useForm<UserFormValues>();
    const queryClient = useQueryClient();

    const { data: usersData, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => users.getAll(),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, values }: { id: number; values: UserFormValues }) =>
            users.update(id, values),
        onSuccess: () => {
            message.success('Пользователь успешно обновлен');
            setIsModalVisible(false);
            setEditingUser(null);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: () => {
            message.error('Ошибка при обновлении пользователя');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => users.delete(id),
        onSuccess: () => {
            message.success('Пользователь успешно удален');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: () => {
            message.error('Ошибка при удалении пользователя');
        },
    });

    const handleEdit = (user: User) => {
        setEditingUser(user);
        form.setFieldsValue({
            name: user.name,
            email: user.email,
            role: user.role,
        });
        setIsModalVisible(true);
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingUser) {
                updateMutation.mutate({ id: editingUser.id, values });
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const columns = [
        {
            title: 'Имя',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Роль',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <Tag color={role === 'admin' ? 'red' : 'blue'}>
                    {role === 'admin' ? 'Администратор' : 'Пользователь'}
                </Tag>
            ),
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_: unknown, record: User) => (
                <Space>
                    <Button type="link" onClick={() => handleEdit(record)}>
                        Редактировать
                    </Button>
                    <Popconfirm
                        title="Удалить пользователя?"
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
                <Title level={4}>Управление пользователями</Title>
            </Space>

            <Table
                columns={columns}
                dataSource={usersData?.data}
                rowKey="id"
                loading={isLoading}
            />

            <Modal
                title="Редактировать пользователя"
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingUser(null);
                    form.resetFields();
                }}
                confirmLoading={updateMutation.isPending}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="Имя"
                        rules={[{ required: true, message: 'Введите имя пользователя' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Введите email пользователя' },
                            { type: 'email', message: 'Введите корректный email' },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Роль"
                        rules={[{ required: true, message: 'Выберите роль пользователя' }]}
                    >
                        <Select>
                            <Option value="user">Пользователь</Option>
                            <Option value="admin">Администратор</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}; 