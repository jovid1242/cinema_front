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
    title: 'Дэдпул и Росомаха',
    description: 'Самый ожидаемый кроссовер Marvel этого года! Дэдпул объединяется с Росомахой для новых безумных приключений.',
    imageUrl: 'https://fight-films.info/wp-content/uploads/2024/07/deadpool-and-wolverine_2024.webp',
    movieId: 1
  },
  {
    id: 2,
    title: 'Гладиатор 2',
    description: 'Продолжение легендарного исторического эпоса возвращается на большие экраны!',
      imageUrl: 'https://kuzbass.media/wp-content/uploads/2024/11/5343654055072886695.jpg',
    movieId: 2
  },
  {
    id: 3,
    title: 'Веном 3',
    description: 'Финальная часть трилогии о симбиоте Веноме и его носителе Эдди Броке!',
      imageUrl: 'https://storage.yandexcloud.net/s3-metaratings-storage/images/33/c8/33c894cfc59b3ddb1545caaad708b699.jpg',
    movieId: 3
  }
];

export const HomeBanner: React.FC = () => {
  return (
    <div className="banner-container">
      <Carousel autoplay effect="fade" autoplaySpeed={3000}>
        {bannerSlides.map(slide => (
          <div key={slide.id}>
            <div className="slide-content">
              <div 
                className="slide-image" 
                style={{ backgroundImage: `url(${slide.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'bottom' }}
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
                    Смотреть
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