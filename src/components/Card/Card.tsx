import React, { useState, useRef, useEffect } from 'react';
import { deckService } from '../../services/DeckService';
import useGameStore from '../../services/gameStore';
import { factionManager } from '../../services/factionManager';
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
  const [connectionTarget, setConnectionTarget] = useState<number | null>(null);
  const [isOverReverseSlot, setIsOverReverseSlot] = useState(false);
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
    if (!isDragging || isInSlot || !cardRef.current || !card) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    setPosition({ x: newX, y: newY });
    
    if (mode === 'attack') {
      // В режиме атаки проверяем соединение с существующими картами
      checkCardConnection(newX, newY, true);
      
      // Если нет активных фракций, можно использовать пустой слот для первой карты
      if (factionManager.getActiveFactions().length === 0) {
        highlightEmptySlot(newX, newY);
      }
    } else if (mode === 'defend') {
      // В режиме защиты проверяем, можно ли добавить карту через reverse-слот
      highlightReverseSlot(newX, newY);
      
      // Всегда проверяем возможность покрытия карт
      highlightOccupiedSlot(newX, newY);
    }
  };
  
  // Проверка соединения карты с существующими картами
  const checkCardConnection = (x: number, y: number, shouldHighlight: boolean = false) => {
    if (!card) return false;
    
    // Удаляем предыдущую подсветку
    document.querySelectorAll('.card-image.faction-connect-highlight, .covered-card-image.faction-connect-highlight').forEach(el => {
      el.classList.remove('faction-connect-highlight');
    });
    
    // Сбрасываем текущую цель соединения
    setConnectionTarget(null);
    
    // Получаем все карты в слотах (как в main slots, так и в covered slots)
    const mainSlotCards = document.querySelectorAll('.slot.occupied .card-image');
    const coveredSlotCards = document.querySelectorAll('.covered-slot .covered-card-image');
    
    const allCards = [...Array.from(mainSlotCards), ...Array.from(coveredSlotCards)];
    if (!cardRef.current) return false;

    const cardRect = cardRef.current.getBoundingClientRect();
    
    for (const targetCard of allCards) {
      const targetRect = targetCard.getBoundingClientRect();
      const isOver = (
        cardRect.right > targetRect.left &&
        cardRect.left < targetRect.right &&
        cardRect.bottom > targetRect.top &&
        cardRect.top < targetRect.bottom
      );
      
      if (isOver) {
        const targetCardId = parseInt(targetCard.getAttribute('data-card-id') || '0');
        
        // Проверяем, можно ли соединить карты по фракциям
        if (factionManager.shouldHighlightForConnection(card, targetCardId)) {
          // Добавляем подсветку в режиме атаки или при shouldHighlight = true
          if (shouldHighlight) {
            targetCard.classList.add('faction-connect-highlight');
          }
          setConnectionTarget(targetCardId);
          return true;
        }
      }
    }
    
    return false;
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
  
  // Подсветка reverse-слота в режиме defend
  const highlightReverseSlot = (x: number, y: number) => {
    const reverseSlot = document.querySelector('.slot.new-slot');
    if (!cardRef.current || !card || !reverseSlot) {
      setIsOverReverseSlot(false);
      return;
    }
    
    const cardRect = cardRef.current.getBoundingClientRect();
    const slotRect = reverseSlot.getBoundingClientRect();
    
    const isOver = (
      cardRect.right > slotRect.left &&
      cardRect.left < slotRect.right &&
      cardRect.bottom > slotRect.top &&
      cardRect.top < slotRect.bottom
    );
    
    // Проверяем, что карта имеет хотя бы одну из активных фракций
    const canAddCard = factionManager.hasActiveFactionsInCard(card);
    
    setIsOverReverseSlot(isOver && canAddCard);
    reverseSlot.classList.toggle('reverse-highlight', isOver && canAddCard);
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
  
  // Общая функция для размещения карты в main slot
  const placeCardInMainSlot = (card: any, targetSlot: Element, slotIndex: number) => {
    if (!cardRef.current) return false;
    
    setSlotIndex(slotIndex);
    setIsInSlot(true);
    
    // Добавляем карту в main slot через фракционный менеджер
    factionManager.addCardToMainSlot(card, slotIndex);
    
    // Вызываем колбэк для оповещения родителя о размещении
    onPlaced();
    
    // Удаляем классы подсветки и добавляем occupied
    targetSlot.classList.remove('highlight', 'reverse-highlight');
    targetSlot.classList.add('occupied');
    
    // Перемещаем карту внутрь слота
    const parentElement = cardRef.current.parentElement;
    if (parentElement) {
      targetSlot.appendChild(parentElement);
      return true;
    }
    
    return false;
  };

  const handleMouseUp = () => {
    if (!isDragging || !card) return;

    if (mode === 'attack') {
      // При наличии цели соединения, обрабатываем соединение
      if (connectionTarget !== null) {
        // Обновляем фракции через соединение
        const success = factionManager.updateFactionsOnConnection(card, connectionTarget);
        
        if (success) {
          // Ищем первый свободный слот и помещаем карту туда
          const slot = document.querySelector('.slot:not(.occupied)');
          if (slot) {
            const index = parseInt(slot.getAttribute('data-slot-index') || '0');
            placeCardInMainSlot(card, slot, index);
          }
        }
      } else if (factionManager.getActiveFactions().length === 0) {
        // Если это первая карта (нет активных фракций), можно положить в пустой слот
        const slot = document.querySelector('.slot.highlight');
        if (slot) {
          const index = parseInt(slot.getAttribute('data-slot-index') || '0');
          placeCardInMainSlot(card, slot, index);
        }
      }
    } else if (mode === 'defend') {
      // В режиме защиты сначала проверяем, находимся ли мы над reverse-слотом
      if (isOverReverseSlot) {
        // Проверяем, имеет ли карта хотя бы одну из активных фракций
        const canAdd = factionManager.hasActiveFactionsInCard(card);
        
        if (canAdd) {
          // Находим reverse-слот и размещаем карту в него
          const reverseSlot = document.querySelector('.slot.new-slot');
          if (reverseSlot) {
            const index = parseInt(reverseSlot.getAttribute('data-slot-index') || '0');
            
            // Обновляем активные фракции, оставляя только общие
            const activeFactions = factionManager.getActiveFactions();
            const commonFactions = card.factions.filter(faction => activeFactions.includes(faction));
            factionManager.updateActiveFactions(commonFactions);
            
            const success = placeCardInMainSlot(card, reverseSlot, index);
            
            if (success) {
              console.log('Карта добавлена в main slot через reverse слот');
            }
          } else {
            console.warn('Не найден reverse слот для размещения карты');
          }
        } else {
          console.warn('Карта не имеет активных фракций');
        }
      } else {
        // Пробуем покрыть карту
        const defendSlot = document.querySelector('.slot.defend-highlight');
        if (defendSlot) {
          const index = parseInt(defendSlot.getAttribute('data-slot-index') || '0');
          
          // Добавляем карту в covered slot и активируем все её фракции
          factionManager.addCardToCoveredSlot(card, index);
          
          coverCard(index, cardId);
          removeActiveCard(cardId);
          defendSlot.classList.remove('defend-highlight');
        }
      }
    }

    setIsDragging(false);
    setIsOverReverseSlot(false);
    
    // Убираем подсветку со всех слотов и карт
    document.querySelectorAll('.slot.highlight, .slot.defend-highlight, .slot.reverse-highlight, .card-image.faction-connect-highlight, .covered-card-image.faction-connect-highlight').forEach(s => {
      s.classList.remove('highlight');
      s.classList.remove('defend-highlight');
      s.classList.remove('reverse-highlight');
      s.classList.remove('faction-connect-highlight');
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
  }, [isDragging, mode, connectionTarget, isOverReverseSlot]);
  
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