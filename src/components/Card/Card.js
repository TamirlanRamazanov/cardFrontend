import React, { useState, useRef, useEffect } from 'react';
import { deckService } from '../../services/DeckService';
import '../../App.css';

const Card = ({ cardId, index }) => {
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  
  const card = deckService.getCardById(cardId);
  
  // Устанавливаем начальную позицию карты
  useEffect(() => {
    const cardElement = getComputedStyle(document.documentElement);
    const baseX = parseFloat(cardElement.getPropertyValue('--card-stack-position-x'));
    const baseY = parseFloat(cardElement.getPropertyValue('--card-stack-position-y'));
    
    // Небольшое смещение каждой следующей карты в стопке
    setPosition({
      x: baseX,
      y: baseY - (index * 2) // Каждая следующая карта немного выше предыдущей
    });
  }, [index]);
  
  const handleMouseDown = (e) => {
    e.preventDefault();
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    setIsDragging(true);
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, handleMouseMove]);
  
  if (!card || !position) return null;
  
  const cardStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: isDragging ? 100 : 3 + index, // Увеличиваем z-index для каждой следующей карты
  };
  
  return (
    <img
      ref={cardRef}
      className="card-image"
      src={`${process.env.PUBLIC_URL}/assets/cards/${card.image}`}
      alt={card.name}
      style={cardStyle}
      onMouseDown={handleMouseDown}
      draggable={false}
    />
  );
};

export default Card;