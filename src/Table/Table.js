import React, { useState, useEffect } from 'react';
import './Table.css';

const Table = ({ children }) => {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    const updateDimensions = () => {
      const aspectRatio = 1141 / 656;
      const maxWidth = 1141;
      const maxHeight = 656;
      
      // Получаем размеры viewport
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      // Вычисляем максимально возможные размеры, сохраняя пропорции
      let width = Math.min(vw * 0.9, maxWidth);
      let height = width / aspectRatio;
      
      // Если высота превышает доступное пространство, пересчитываем от высоты
      if (height > vh * 0.9) {
        height = vh * 0.9;
        width = height * aspectRatio;
      }
      
      setDimensions({
        width: Math.round(width),
        height: Math.round(height)
      });
    };

    // Инициализация размеров
    updateDimensions();

    // Добавляем слушатель изменения размера окна
    window.addEventListener('resize', updateDimensions);

    // Очистка при размонтировании
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div 
      className="table-container"
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`
      }}
    >
      <img 
        src={`${process.env.PUBLIC_URL}/table.png`} 
        alt="Card Table" 
        className="table-image"
      />
      {children}
    </div>
  );
};

export default Table; 