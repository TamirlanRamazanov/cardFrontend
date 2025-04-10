import React, { useState, useRef, useEffect } from 'react';
import { deckService } from '../../services/DeckService';
import useGameStore from '../../services/gameStore';
import './Card.css';

interface CardProps {
  cardId: number;
  index: number;
  onPlaced: () => void;
}

interface Position {
  x: number;
  y: number;
}

const Card: React.FC<CardProps> = ({ cardId, index, onPlaced }) => {
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isInSlot, setIsInSlot] = useState(false);
  const [slotIndex, setSlotIndex] = useState<number | null>(null);
  const cardRef = useRef<HTMLImageElement>(null);
  
  // Получаем данные из Zustand
  const { mode, coverCard, removeActiveCard, isSlotCovered, canPlaceCardInDefendMode, getCardById } = useGameStore();
  
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
  
  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    // Разрешаем перетаскивание карт в любом режиме, но запрещаем для карт в слотах
    if (isInSlot) return;
    
    e.preventDefault();
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Вычисляем смещение относительно точки клика внутри карты
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || isInSlot || !cardRef.current) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    setPosition({ x: newX, y: newY });
    
    if (mode === 'attack') {
      highlightEmptySlot(newX, newY);
    } else if (mode === 'defend') {
      if (canPlaceCardInDefendMode()) {
        highlightEmptySlot(newX, newY);
      }
      // Всегда проверяем возможность покрытия карт
      highlightOccupiedSlot(newX, newY);
    }
  };
  
  const highlightEmptySlot = (x: number, y: number) => {
    const slots = document.querySelectorAll('.slot:not(.occupied)');
    if (!cardRef.current) return;
    
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
  
  const highlightOccupiedSlot = (x: number, y: number) => {
    const slots = document.querySelectorAll('.slot.occupied');
    if (!cardRef.current || !card) return;
    
    const cardRect = cardRef.current.getBoundingClientRect();

    slots.forEach(slot => {
      const slotRect = slot.getBoundingClientRect();
      const isOver = (
        cardRect.right > slotRect.left &&
        cardRect.left < slotRect.right &&
        cardRect.bottom > slotRect.top &&
        cardRect.top < slotRect.bottom
      );
      
      // Получаем индекс слота
      const slotIndex = parseInt(slot.getAttribute('data-slot-index') || '0');
      
      // Проверяем, не покрыт ли уже этот слот
      const isCovered = isSlotCovered(slotIndex);

      // Получаем ID карты в слоте
      const slotCardElement = slot.querySelector('.card-image');
      let canCover = false;

      if (slotCardElement) {
        // Получаем ID карты из атрибута data-card-id
        const slotCardId = parseInt(slotCardElement.getAttribute('data-card-id') || '0');
        const slotCard = getCardById(slotCardId);
        
        // Проверяем мощность карт
        if (slotCard && card) {
          // Можно покрыть только если power текущей карты больше power карты в слоте
          canCover = card.power >= slotCard.power;
        }
      }
      
      // Подсвечиваем только если слот не покрыт и мощность покрывающей карты больше
      slot.classList.toggle('defend-highlight', isOver && !isCovered && canCover);
    });
  };
  
  const handleMouseUp = () => {
    if (!isDragging || !card) return;

    if (mode === 'attack') {
      const slot = document.querySelector('.slot.highlight');
      if (slot && cardRef.current) {
        // Получаем индекс слота среди всех слотов
        const index = parseInt(slot.getAttribute('data-slot-index') || '0');
        setSlotIndex(index);
        setIsInSlot(true);
        onPlaced();
        slot.classList.remove('highlight');
        slot.classList.add('occupied');
        
        // Перемещаем карту внутрь слота
        const parentElement = cardRef.current.parentElement;
        if (parentElement) {
          slot.appendChild(parentElement);
        }
      }
    } else if (mode === 'defend') {
      // Сначала проверяем возможность размещения в main slots
      if (canPlaceCardInDefendMode()) {
        const slot = document.querySelector('.slot.highlight');
        if (slot && cardRef.current) {
          const index = parseInt(slot.getAttribute('data-slot-index') || '0');
          setSlotIndex(index);
          setIsInSlot(true);
          onPlaced();
          slot.classList.remove('highlight');
          slot.classList.add('occupied');
          
          const parentElement = cardRef.current.parentElement;
          if (parentElement) {
            slot.appendChild(parentElement);
          }
        } else {
          // Если не удалось разместить в main slot, пробуем покрыть карту
          const defendSlot = document.querySelector('.slot.defend-highlight');
          if (defendSlot) {
            const index = parseInt(defendSlot.getAttribute('data-slot-index') || '0');
            coverCard(index, cardId);
            removeActiveCard(cardId);
            defendSlot.classList.remove('defend-highlight');
          }
        }
      } else {
        // Если нельзя размещать в main slots, пробуем только покрыть карту
        const defendSlot = document.querySelector('.slot.defend-highlight');
        if (defendSlot) {
          const index = parseInt(defendSlot.getAttribute('data-slot-index') || '0');
          coverCard(index, cardId);
          removeActiveCard(cardId);
          defendSlot.classList.remove('defend-highlight');
        }
      }
    }

    setIsDragging(false);
    // Убираем подсветку со всех слотов
    document.querySelectorAll('.slot.highlight, .slot.defend-highlight').forEach(s => {
      s.classList.remove('highlight');
      s.classList.remove('defend-highlight');
    });
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
  }, [isDragging, mode]);
  
  if (!card || !position) return null;

  return (
    <div className={`card-wrapper ${isInSlot ? 'in-slot' : ''}`}>
      <img
        ref={cardRef}
        className={`card-image ${isInSlot ? 'in-slot' : ''} ${isDragging ? 'dragging' : ''}`}
        src={`${process.env.PUBLIC_URL}/assets/cards/${card.image}`}
        alt={card.name}
        data-card-id={card.id}
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