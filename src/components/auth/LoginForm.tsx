import React, { useEffect } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormValues {
    email: string;
    password: string;
}

export const LoginForm: React.FC = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();

    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

    useEffect(() => {
        if (user && user.role === 'admin') {
            navigate('/admin', { replace: true });
        }
    }, [user, navigate]);

    const onFinish = async (values: LoginFormValues) => {
        try {
            const result = await login(values.email, values.password);
            console.log('Login result:', result);
            message.success('Успешный вход');
            
            const userData = localStorage.getItem('userData');
            if (userData) {
                try {
                    const parsedUser = JSON.parse(userData);
                    console.log('Parsed user data from localStorage:', parsedUser);
                }
                catch (e) {
                    console.error('Error parsing user data from localStorage:', e);
                }
            }
            
            const token = localStorage.getItem('token');
            if (token) {
                if (user) {
                    console.log('User data after login:', user);
                    if (user.role === 'admin') {
                        navigate('/admin', { replace: true });
                    } else {
                        navigate(from, { replace: true });
                    }
                } else {
                    setTimeout(() => {
                        navigate('/', { replace: true });
                    }, 500);
                }
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Ошибка входа';
            message.error(errorMessage);
        }
    };

    return (
        <Card title="Вход в систему" className="auth-form">
            <Form
                form={form}
                name="login"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
            >
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Пожалуйста, введите email' },
                        { type: 'email', message: 'Введите корректный email' }
                    ]}
                >
                    <Input
                        prefix={<UserOutlined />}
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

                <Form.Item>
                    <Button type="primary" htmlType="submit" block size="large">
                        Войти
                    </Button>
                </Form.Item>

                <div style={{ textAlign: 'center' }}>
                    Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                </div>
            </Form>
        </Card>
    );
}; 
