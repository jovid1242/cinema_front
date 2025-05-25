import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Button, Space } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    HomeOutlined,
    UserOutlined,
    LogoutOutlined,
    DashboardOutlined,
    LoginOutlined,
    UserAddOutlined,
    MenuOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import './Navigation.css';

const { Header } = Layout;

export const Navigation: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
                setMobileMenuVisible(false);
            }
        };

        if (mobileMenuVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mobileMenuVisible]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
            setMobileMenuVisible(false);
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
    };

    const handleMenuClick = () => {
        setMobileMenuVisible(false);
    };

    const toggleMobileMenu = () => {
        setMobileMenuVisible(!mobileMenuVisible);
    };

    const menuItems = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: <Link to="/" onClick={handleMenuClick}>Главная</Link>,
        },
        ...(user
            ? [
                  {
                      key: '/profile',
                      icon: <UserOutlined />,
                      label: <Link to="/profile" onClick={handleMenuClick}>Профиль</Link>,
                  },
                  ...(user.role === 'admin'
                      ? [
                            {
                                key: '/admin',
                                icon: <DashboardOutlined />,
                                label: <Link to="/admin" onClick={handleMenuClick}>Админ-панель</Link>,
                            },
                        ]
                      : []),
              ]
            : []),
    ];

    return (
        <Header className="navigation-header" ref={headerRef}>
            <Button
                className="mobile-menu-toggle"
                icon={<MenuOutlined />}
                onClick={toggleMobileMenu}
            />
            <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={[location.pathname]}
                items={menuItems}
                className={`navigation-menu ${mobileMenuVisible ? 'mobile-visible' : ''}`}
            />
            <Space className="navigation-actions">
                {user ? (
                    <Button
                        type="text"
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        className="navigation-button"
                    >
                        <span>Выйти</span>
                    </Button>
                ) : (
                    <>
                        <Button
                            type="text"
                            icon={<LoginOutlined />}
                            onClick={() => navigate('/login')}
                            className="navigation-button"
                        >
                            <span>Войти</span>
                        </Button>
                        <Button
                            type="text"
                            icon={<UserAddOutlined />}
                            onClick={() => navigate('/register')}
                            className="navigation-button"
                        >
                            <span>Регистрация</span>
                        </Button>
                    </>
                )}
            </Space>
        </Header>
    );
}; 
