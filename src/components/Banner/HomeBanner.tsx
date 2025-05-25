import React from 'react';
import { Carousel, Button, Typography } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './HomeBanner.css';

const { Title, Paragraph } = Typography;

interface BannerSlide {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  movieId: number;
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    title: 'Пункт назначения',
    description: 'Семья, которая не может быть разорвана, должна быть собрана.',
    imageUrl: 'https://images.kinomax.ru/1980/b/40/867697_4075.webp',
    movieId: 5
  },
  {
    id: 2,
    title: 'Громовержцы',
    description: 'Громовержцы — это группа людей, которые не боятся громких слов и действий.',
    imageUrl: 'https://images.kinomax.ru/1980/b/40/378148_4044.webp',
    movieId: 1
  },
  {
    id: 3,
    title: 'Лило и Стич',
    description: 'Лило и Стич — это группа людей, которые не боятся громких слов и действий.',
    imageUrl: 'https://images.kinomax.ru/1980/b/40/844007_4088.webp',
    movieId: 13
  }
];

export const HomeBanner: React.FC = () => {
  return (
    <div className="banner-container">
      <Carousel autoplay effect="fade" autoplaySpeed={2000}>
        {bannerSlides.map(slide => (
          <div key={slide.id}>
            <div className="slide-content">
              <img 
                src={slide.imageUrl} 
                alt={slide.title}
                className="slide-image"
              />
              <div className="slide-overlay">
                <Title level={1} className="slide-title">{slide.title}</Title>
                <Paragraph className="slide-description">{slide.description}</Paragraph>
                <Link to={`/movies/${slide.movieId}`}>
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<PlayCircleOutlined />} 
                    className="watch-button"
                  >
                    Купить билет
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}; 
