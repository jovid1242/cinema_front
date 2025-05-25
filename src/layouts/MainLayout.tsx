import React from 'react';
import { Layout } from 'antd';
import { Navigation } from '../components/common/Navigation';
import './MainLayout.css';

const { Content, Footer } = Layout;

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <Layout className="main-layout">
            <Navigation />
            <Content className="main-layout-content">
                <div className="site-layout-content">{children}</div>
            </Content>
            <Footer className="main-layout-footer">
                <div className="main-layout-footer-title">
                    Кинотеатр ©{new Date().getFullYear()} Jovid Masharipov
                </div>
                <div className="main-layout-footer-subtitle">
                    ДИС 232.2/21
                </div>
            </Footer>
        </Layout>
    );
}; 
