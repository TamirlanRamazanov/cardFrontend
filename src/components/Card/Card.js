import React, { useState, useEffect } from 'react';
import './Card.css';
import { deckService } from '../../services/DeckService';

const Card = ({ cardId }) => {
  const [cardData, setCardData] = useState(null);
  const [position, setPosition] = useState({ 
    x: window.innerWidth * 0.1,
    y: window.innerHeight * 0.8
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Добавляем обработчик движения мыши на уровне документа
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        requestAnimationFrame(() => {
          setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
          });
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  useEffect(() => {
    const card = deckService.getCardById(cardId);
    setCardData(card);
  }, [cardId]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  if (!cardData) return null;

  // Используем импорт изображения через process.env.PUBLIC_URL
  const imagePath = `${process.env.PUBLIC_URL}/assets/cards/${cardData.image}`;

  return (
    <img 
      src={imagePath}
      alt={cardData.name} 
      className='card-image card-draggable'
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) scale(0.125)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
      }}
      onMouseDown={handleMouseDown}
    />
  );
};

export default Card; 