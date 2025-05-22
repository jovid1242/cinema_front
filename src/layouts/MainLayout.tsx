import React from 'react';
import { Layout } from 'antd';
import { Navigation } from '../components/common/Navigation';

const { Content, Footer } = Layout;

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Navigation />
            <Content style={{ padding: '24px 50px' }}>
                <div className="site-layout-content">{children}</div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                Кинотеатр ©{new Date().getFullYear()} Jovid Masharipov ДИС 232.2/21
            </Footer>
        </Layout>
    );
}; 