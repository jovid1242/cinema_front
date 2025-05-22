import React from 'react';
import { Layout, Menu, Button, Space } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    HomeOutlined,
    UserOutlined,
    LogoutOutlined,
    DashboardOutlined,
    LoginOutlined,
    UserAddOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Header } = Layout;

export const Navigation: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
    };

    const menuItems = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: <Link to="/">Главная</Link>,
        },
        ...(user
            ? [
                  {
                      key: '/profile',
                      icon: <UserOutlined />,
                      label: <Link to="/profile">Профиль</Link>,
                  },
                  ...(user.role === 'admin'
                      ? [
                            {
                                key: '/admin',
                                icon: <DashboardOutlined />,
                                label: <Link to="/admin">Админ-панель</Link>,
                            },
                        ]
                      : []),
              ]
            : []),
    ];

    return (
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={[location.pathname]}
                items={menuItems}
                style={{ flex: 1 }}
            />
            <Space>
                {user ? (
                    <Button
                        type="text"
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        style={{ color: 'white' }}
                    >
                        Выйти
                    </Button>
                ) : (
                    <>
                        <Button
                            type="text"
                            icon={<LoginOutlined />}
                            onClick={() => navigate('/login')}
                            style={{ color: 'white' }}
                        >
                            Войти
                        </Button>
                        <Button
                            type="text"
                            icon={<UserAddOutlined />}
                            onClick={() => navigate('/register')}
                            style={{ color: 'white' }}
                        >
                            Регистрация
                        </Button>
                    </>
                )}
            </Space>
        </Header>
    );
}; 