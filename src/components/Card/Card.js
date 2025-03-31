import React, { useState, useRef, useEffect } from 'react';
import { deckService } from '../../services/DeckService';
import useGameStore from '../../services/gameStore';
import './Card.css';

const Card = ({ cardId, index, onPlaced }) => {
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isInSlot, setIsInSlot] = useState(false);
  const [slotIndex, setSlotIndex] = useState(null);
  const cardRef = useRef(null);
  
  // Получаем текущий режим из Zustand
  const mode = useGameStore(state => state.mode);
  
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
    // В режиме защиты нельзя перетаскивать карты в слоты
    if (isInSlot || mode === 'defend') return;
    
    e.preventDefault();
    const rect = cardRef.current.getBoundingClientRect();
    
    // Вычисляем смещение относительно точки клика внутри карты
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging || isInSlot) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    setPosition({ x: newX, y: newY });
    highlightSlot(newX, newY);
  };
  
  const highlightSlot = (x, y) => {
    // В режиме защиты не подсвечиваем слоты
    if (mode === 'defend') return;
    
    const slots = document.querySelectorAll('.slot:not(.occupied)');
    const cardRect = cardRef.current.getBoundingClientRect();

    slots.forEach(slot => {
      const slotRect = slot.getBoundingClientRect();
      const isOver = (
        cardRect.right > slotRect.left &&
        cardRect.left < slotRect.right &&
        cardRect.bottom > slotRect.top &&
        cardRect.top < slotRect.bottom
      );
      
      slot.classList.toggle('highlight', isOver);
    });
  };
  
  const handleMouseUp = () => {
    if (!isDragging) return;

    const slot = document.querySelector('.slot.highlight');
    if (slot) {
      // Получаем индекс слота среди всех слотов
      const index = Array.from(slot.parentNode.children).indexOf(slot);
      setSlotIndex(index);
      setIsInSlot(true);
      onPlaced();
      slot.classList.remove('highlight');
      slot.classList.add('occupied');
      
      // Перемещаем карту внутрь слота
      slot.appendChild(cardRef.current.parentElement);
    }

    setIsDragging(false);
    // Убираем подсветку со всех слотов
    document.querySelectorAll('.slot.highlight').forEach(s => s.classList.remove('highlight'));
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  if (!card || !position) return null;
  
  return (
    <div className={`card-wrapper ${isInSlot ? 'in-slot' : ''}`}>
      <img
        ref={cardRef}
        className={`card-image ${isInSlot ? 'in-slot' : ''} ${isDragging ? 'dragging' : ''}`}
        src={`${process.env.PUBLIC_URL}/assets/cards/${card.image}`}
        alt={card.name}
        style={{
          ...(isInSlot ? {} : {
            left: `${position.x}px`,
            top: `${position.y}px`,
          }),
          transition: isDragging ? 'none' : 'all 0.3s ease',
        }}
        onMouseDown={handleMouseDown}
        draggable={false}
      />
    </div>
  );
};

export default Card;