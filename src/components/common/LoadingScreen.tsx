import React from 'react';
import { Spin, Layout, Typography } from 'antd';

interface LoadingScreenProps {
    tip?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ tip = 'Загрузка...' }) => {
    return (
        <Layout style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: '#f0f2f5'
        }}>
            <div style={{ textAlign: 'center' }}>
                <Spin size="large" />
                <Typography.Text style={{ display: 'block', marginTop: 16 }}>
                    {tip}
                </Typography.Text>
            </div>
        </Layout>
    );
}; 