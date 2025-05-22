import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Space, Button, Avatar, Dropdown } from 'antd';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    DashboardOutlined,
    FileOutlined,
    BankOutlined,
    CalendarOutlined,
    UserOutlined,
    BarChartOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const menuItems = [
    {
        key: '/admin',
        icon: <DashboardOutlined />,
        label: 'Обзор',
    },
    {
        key: '/admin/movies',
        icon: <FileOutlined />,
        label: 'Фильмы',
    },
    {
        key: '/admin/halls',
        icon: <BankOutlined />,
        label: 'Залы',
    },
    {
        key: '/admin/sessions',
        icon: <CalendarOutlined />,
        label: 'Сеансы',
    },
    {
        key: '/admin/users',
        icon: <UserOutlined />,
        label: 'Пользователи',
    },
    // {
    //     key: '/admin/statistics',
    //     icon: <BarChartOutlined />,
    //     label: 'Статистика',
    // },
];

export const AdminLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    
    useEffect(() => {
        localStorage.setItem('lastAdminPath', location.pathname);
    }, [location.pathname]);

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };
    
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    
    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Профиль',
            onClick: () => navigate('/profile'),
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Выйти',
            onClick: handleLogout,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                theme="light"
                style={{
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    overflow: 'auto',
                    height: '100vh',
                    position: 'sticky',
                    top: 0,
                    left: 0,
                }}
            >
                <div style={{ padding: '16px', textAlign: 'center' }}>
                    <Link to="/">
                        <Title level={4} style={{ margin: 0 }}>
                            {collapsed ? 'К' : 'Кинотеатр'}
                        </Title>
                    </Link>
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                />
            </Sider>
            <Layout>
                <Header style={{ 
                    background: '#fff', 
                    padding: '0 24px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <Space style={{ height: '100%' }}>
                        <Title level={4} style={{ margin: 0 }}>
                            {menuItems.find(item => item.key === location.pathname)?.label || 'Панель управления'}
                        </Title>
                    </Space>
                    
                    <Space>
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <Button type="text" icon={<Avatar icon={<UserOutlined />} />}>
                                {!collapsed && user?.name}
                            </Button>
                        </Dropdown>
                    </Space>
                </Header>
                <Content style={{ margin: '24px', padding: '24px', background: '#fff', minHeight: 280 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}; 