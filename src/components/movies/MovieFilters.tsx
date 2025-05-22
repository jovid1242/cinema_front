import React from 'react';
import { Form, Input, Select, Space, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

const { Option } = Select;

interface MovieFiltersProps {
    onFilter: (values: {
        search?: string;
        genre?: string;
        year?: number;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    }) => void;
    genres: string[];
    years: number[];
}

export const MovieFilters: React.FC<MovieFiltersProps> = ({ onFilter, genres, years }) => {
    const [form] = Form.useForm();

    const handleReset = () => {
        form.resetFields();
        onFilter({});
    };

    return (
        <Form
            form={form}
            onFinish={onFilter}
            layout="vertical"
            style={{ marginBottom: 24 }}
        >
            <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space wrap>
                    <Form.Item name="search" style={{ marginBottom: 0 }}>
                        <Input
                            placeholder="Поиск фильмов"
                            prefix={<SearchOutlined />}
                            style={{ width: 200 }}
                            allowClear
                        />
                    </Form.Item>

                    <Form.Item name="genre" style={{ marginBottom: 0 }}>
                        <Select
                            placeholder="Жанр"
                            style={{ width: 150 }}
                            allowClear
                        >
                            {genres.map((genre) => (
                                <Option key={genre} value={genre}>
                                    {genre}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="year" style={{ marginBottom: 0 }}>
                        <Select
                            placeholder="Год"
                            style={{ width: 120 }}
                            allowClear
                        >
                            {years.map((year) => (
                                <Option key={year} value={year}>
                                    {year}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="sort_by" style={{ marginBottom: 0 }}>
                        <Select
                            placeholder="Сортировка"
                            style={{ width: 150 }}
                            allowClear
                        >
                            <Option value="title">По названию</Option>
                            <Option value="release_year">По году</Option>
                            <Option value="created_at">По дате добавления</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="sort_order" style={{ marginBottom: 0 }}>
                        <Select
                            placeholder="Порядок"
                            style={{ width: 120 }}
                            allowClear
                        >
                            <Option value="asc">По возрастанию</Option>
                            <Option value="desc">По убыванию</Option>
                        </Select>
                    </Form.Item>
                </Space>

                <Space>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<FilterOutlined />}
                    >
                        Применить
                    </Button>
                    <Button onClick={handleReset}>
                        Сбросить
                    </Button>
                </Space>
            </Space>
        </Form>
    );
};
