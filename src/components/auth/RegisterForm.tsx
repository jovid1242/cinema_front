import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterFormValues {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export const RegisterForm: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onFinish = async (values: RegisterFormValues) => {
        try {
            await register(values.name, values.email, values.password, values.password_confirmation);
            message.success('Регистрация успешна');
            navigate('/');
        } catch (error: unknown) {
            if (error instanceof Error) {
                message.error(error.message);
            } else {
                message.error('Ошибка регистрации');
            }
        }
    };

    return (
        <Card title="Регистрация" className="auth-form">
            <Form
                form={form}
                name="register"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
            >
                <Form.Item
                    name="name"
                    rules={[
                        { required: true, message: 'Пожалуйста, введите имя' },
                        { min: 2, message: 'Имя должно быть не менее 2 символов' }
                    ]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="Имя"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Пожалуйста, введите email' },
                        { type: 'email', message: 'Введите корректный email' }
                    ]}
                >
                    <Input
                        prefix={<MailOutlined />}
                        placeholder="Email"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[
                        { required: true, message: 'Пожалуйста, введите пароль' },
                        { min: 6, message: 'Пароль должен быть не менее 6 символов' }
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Пароль"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    name="password_confirmation"
                    dependencies={['password']}
                    rules={[
                        { required: true, message: 'Пожалуйста, подтвердите пароль' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Пароли не совпадают'));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Подтверждение пароля"
                        size="large"
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block size="large">
                        Зарегистрироваться
                    </Button>
                </Form.Item>

                <div style={{ textAlign: 'center' }}>
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </div>
            </Form>
        </Card>
    );
}; 