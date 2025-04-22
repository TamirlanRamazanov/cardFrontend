import React, { useState, useRef, useEffect, useMemo } from 'react';
import { deckService } from '../../services/DeckService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { RootState } from '../../store';
import { 
  selectMode, 
  coverCard, 
  removeActiveCard,
  selectIsSlotCovered,
  selectCanPlaceCardInDefendMode,
  getCardByIdHelper,
  selectCoveredCards
} from '../../store/slices/gameSlice';
import { 
  selectActiveFactions,
  selectHasActiveFactionsInCard,
  selectCanConnectCards,
  updateFactionsOnConnection,
  addCardToMainSlot,
  addCardToCoveredSlot,
  updateActiveFactions
} from '../../store/slices/factionSlice';
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
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectMode);
  const activeFactions = useAppSelector(selectActiveFactions);
  
  // Получаем карту из сервиса
  const card = deckService.getCardById(cardId);
  
  // Проверяем, имеет ли карта активные фракции
  const hasActiveFactionsInCard = useAppSelector(state => 
    card ? selectHasActiveFactionsInCard(state, card) : false
  );

  // Получаем состояние покрытых слотов для использования в highlightOccupiedSlot
  const coveredCards = useAppSelector(selectCoveredCards);

  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isInSlot, setIsInSlot] = useState(false);
  const [slotIndex, setSlotIndex] = useState<number | null>(null);
  const [connectionTarget, setConnectionTarget] = useState<number | null>(null);
  const [isOverReverseSlot, setIsOverReverseSlot] = useState(false);
  const cardRef = useRef<HTMLImageElement>(null);
  
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
    try {
      // Разрешаем перетаскивание карт в любом режиме, но запрещаем для карт в слотах
      if (isInSlot) return;
      
      e.preventDefault();
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect || !cardRef.current || !document.body.contains(cardRef.current)) return;
      
      // Вычисляем смещение относительно точки клика внутри карты
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      
      setDragOffset({ x: offsetX, y: offsetY });
      setIsDragging(true);
    } catch (error) {
      console.error('Error in handleMouseDown:', error);
    }
  };

  // Обработчик для сенсорного начала перетаскивания
  const handleTouchStart = (e: React.TouchEvent<HTMLImageElement>) => {
    try {
      if (isInSlot) return;
      
      e.preventDefault(); // Предотвращаем скролл при перетаскивании
      
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect || e.touches.length === 0 || !cardRef.current || !document.body.contains(cardRef.current)) return;
      
      const touch = e.touches[0];
      // Вычисляем смещение относительно точки касания внутри карты
      const offsetX = touch.clientX - rect.left;
      const offsetY = touch.clientY - rect.top;
      
      setDragOffset({ x: offsetX, y: offsetY });
      setIsDragging(true);
    } catch (error) {
      console.error('Error in handleTouchStart:', error);
    }
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || isInSlot || !cardRef.current || !card) return;

    try {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      setPosition({ x: newX, y: newY });
      
      if (mode === 'attack') {
        // В режиме атаки проверяем соединение с существующими картами
        checkCardConnection(newX, newY, true);
        
        // Если нет активных фракций, можно использовать пустой слот для первой карты
        if (activeFactions.length === 0) {
          highlightEmptySlot(newX, newY);
        }
      } else if (mode === 'defend') {
        // В режиме защиты проверяем, можно ли добавить карту через reverse-слот
        highlightReverseSlot(newX, newY);
        
        // Всегда проверяем возможность покрытия карт
        highlightOccupiedSlot(newX, newY);
      }
    } catch (error) {
      console.error('Error in handleMouseMove:', error);
      // Сбрасываем состояние перетаскивания при ошибке
      setIsDragging(false);
    }
  };

  // Обработчик для сенсорного перетаскивания
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || isInSlot || !cardRef.current || !card || e.touches.length === 0) return;

    try {
      const touch = e.touches[0];
      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;
      
      setPosition({ x: newX, y: newY });
      
      if (mode === 'attack') {
        // В режиме атаки проверяем соединение с существующими картами
        checkCardConnection(newX, newY, true);
        
        // Если нет активных фракций, можно использовать пустой слот для первой карты
        if (activeFactions.length === 0) {
          highlightEmptySlot(newX, newY);
        }
      } else if (mode === 'defend') {
        // В режиме защиты проверяем, можно ли добавить карту через reverse-слот
        highlightReverseSlot(newX, newY);
        
        // Всегда проверяем возможность покрытия карт
        highlightOccupiedSlot(newX, newY);
      }
    } catch (error) {
      console.error('Error in handleTouchMove:', error);
      // Сбрасываем состояние перетаскивания при ошибке
      setIsDragging(false);
    }
  };
  
  // Проверка соединения карты с существующими картами
  const checkCardConnection = (x: number, y: number, shouldHighlight: boolean = false) => {
    if (!card) return false;
    
    try {
      // Удаляем предыдущую подсветку
      document.querySelectorAll('.slot.faction-connect-highlight').forEach(el => {
        if (document.body.contains(el)) {
          el.classList.remove('faction-connect-highlight');
        }
      });
      document.querySelectorAll('.covered-card-image.faction-connect-highlight').forEach(el => {
        if (document.body.contains(el)) {
          el.classList.remove('faction-connect-highlight');
        }
      });
      
      // Сбрасываем текущую цель соединения
      setConnectionTarget(null);
      
      // Получаем все карты в слотах (как в main slots, так и в covered slots)
      const mainSlotCards = document.querySelectorAll('.slot.occupied .card-image');
      const coveredSlotCards = document.querySelectorAll('.covered-slot .covered-card-image');
      
      const allCards = [...Array.from(mainSlotCards), ...Array.from(coveredSlotCards)];
      if (!cardRef.current || !document.body.contains(cardRef.current)) return false;

      const cardRect = cardRef.current.getBoundingClientRect();
      
      for (const targetCard of allCards) {
        // Проверяем, что целевая карта всё ещё в DOM
        if (!document.body.contains(targetCard)) continue;
        
        const targetRect = targetCard.getBoundingClientRect();
        const isOver = (
          cardRect.right > targetRect.left &&
          cardRect.left < targetRect.right &&
          cardRect.bottom > targetRect.top &&
          cardRect.top < targetRect.bottom
        );
        
        if (isOver) {
          const targetCardId = parseInt(targetCard.getAttribute('data-card-id') || '0');
          
          // Проверяем, можно ли соединить карты по фракциям с помощью временного состояния
          // вместо использования useAppSelector в цикле
          const canConnect = card.factions.some(faction => {
            const targetCard = deckService.getCardById(targetCardId);
            return targetCard?.factions.includes(faction) ?? false;
          });
          
          if (canConnect) {
            // Добавляем подсветку в режиме атаки или при shouldHighlight = true
            if (shouldHighlight) {
              // Для обычных слотов
              if (targetCard.classList.contains('card-image')) {
                const parentSlot = targetCard.closest('.slot');
                if (parentSlot && document.body.contains(parentSlot)) {
                  parentSlot.classList.add('faction-connect-highlight');
                }
              } 
              // Для covered слотов
              else if (targetCard.classList.contains('covered-card-image') && document.body.contains(targetCard)) {
                targetCard.classList.add('faction-connect-highlight');
              }
            }
            setConnectionTarget(targetCardId);
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error in checkCardConnection:', error);
      return false;
    }
  };
  
  const highlightEmptySlot = (x: number, y: number) => {
    try {
      const slots = document.querySelectorAll('.slot:not(.occupied)');
      if (!cardRef.current || !document.body.contains(cardRef.current)) return;
      
      const cardRect = cardRef.current.getBoundingClientRect();

      slots.forEach(slot => {
        if (!document.body.contains(slot)) return;
        
        const slotRect = slot.getBoundingClientRect();
        const isOver = (
          cardRect.right > slotRect.left &&
          cardRect.left < slotRect.right &&
          cardRect.bottom > slotRect.top &&
          cardRect.top < slotRect.bottom
        );
        
        slot.classList.toggle('highlight', isOver);
      });
    } catch (error) {
      console.error('Error in highlightEmptySlot:', error);
    }
  };
  
  // Подсветка reverse-слота в режиме defend
  const highlightReverseSlot = (x: number, y: number) => {
    try {
      const reverseSlot = document.querySelector('.slot.new-slot');
      if (!cardRef.current || !card || !reverseSlot || !document.body.contains(reverseSlot)) {
        setIsOverReverseSlot(false);
        return;
      }
      
      if (!document.body.contains(cardRef.current)) {
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
      
      setIsOverReverseSlot(isOver && hasActiveFactionsInCard);
      reverseSlot.classList.toggle('reverse-highlight', isOver && hasActiveFactionsInCard);
    } catch (error) {
      console.error('Error in highlightReverseSlot:', error);
      setIsOverReverseSlot(false);
    }
  };
  
  const highlightOccupiedSlot = (x: number, y: number) => {
    try {
      const slots = document.querySelectorAll('.slot.occupied');
      if (!cardRef.current || !card || !document.body.contains(cardRef.current)) return;
      
      const cardRect = cardRef.current.getBoundingClientRect();

      slots.forEach(slot => {
        if (!document.body.contains(slot)) return;
        
        const slotRect = slot.getBoundingClientRect();
        const isOver = (
          cardRect.right > slotRect.left &&
          cardRect.left < slotRect.right &&
          cardRect.bottom > slotRect.top &&
          cardRect.top < slotRect.bottom
        );
        
        // Получаем индекс слота
        const currentSlotIndex = parseInt(slot.getAttribute('data-slot-index') || '0');
        
        // Проверяем, не покрыт ли уже этот слот без использования useAppSelector внутри колбэка
        const isCovered = !!coveredCards[currentSlotIndex];

        // Получаем ID карты в слоте
        const slotCardElement = slot.querySelector('.card-image');
        let canCover = false;

        if (slotCardElement && document.body.contains(slotCardElement)) {
          // Получаем ID карты из атрибута data-card-id
          const slotCardId = parseInt(slotCardElement.getAttribute('data-card-id') || '0');
          const slotCard = getCardByIdHelper(slotCardId);
          
          // Проверяем мощность карт
          if (slotCard && card) {
            // Можно покрыть только если power текущей карты больше power карты в слоте
            canCover = card.power >= slotCard.power;
          }
        }
        
        // Подсвечиваем только если слот не покрыт и мощность покрывающей карты больше
        slot.classList.toggle('defend-highlight', isOver && !isCovered && canCover);
      });
    } catch (error) {
      console.error('Error in highlightOccupiedSlot:', error);
    }
  };
  
  // Общая функция для размещения карты в main slot
  const placeCardInMainSlot = (card: any, targetSlot: Element, slotIndex: number) => {
    if (!cardRef.current) return false;
    
    setSlotIndex(slotIndex);
    setIsInSlot(true);
    
    // Добавляем карту в main slot через Redux
    dispatch(addCardToMainSlot({ card, slotIndex }));
    
    // Вызываем колбэк для оповещения родителя о размещении
    onPlaced();
    
    // Удаляем классы подсветки и добавляем occupied
    targetSlot.classList.remove('highlight', 'reverse-highlight');
    targetSlot.classList.add('occupied');
    
    // Перемещаем карту внутрь слота только если она все еще существует
    const parentElement = cardRef.current.parentElement;
    if (parentElement && document.body.contains(parentElement) && document.body.contains(targetSlot as Node)) {
      try {
        targetSlot.appendChild(parentElement);
        return true;
      } catch (error) {
        console.error('Error moving card to slot:', error);
        return false;
      }
    }
    
    return false;
  };

  const handleMouseUp = () => {
    if (!isDragging || !card) return;

    try {
      if (mode === 'attack') {
        // При наличии цели соединения, обрабатываем соединение
        if (connectionTarget !== null) {
          // Обновляем фракции через соединение
          dispatch(updateFactionsOnConnection({ newCard: card, existingCardId: connectionTarget }));
          
          // Ищем первый свободный слот и помещаем карту туда
          const slot = document.querySelector('.slot:not(.occupied)');
          if (slot) {
            const index = parseInt(slot.getAttribute('data-slot-index') || '0');
            placeCardInMainSlot(card, slot, index);
          }
        } else if (activeFactions.length === 0) {
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
          if (hasActiveFactionsInCard) {
            // Находим reverse-слот и размещаем карту в него
            const reverseSlot = document.querySelector('.slot.new-slot');
            if (reverseSlot) {
              const index = parseInt(reverseSlot.getAttribute('data-slot-index') || '0');
              
              // Обновляем активные фракции, оставляя только общие
              const commonFactions = card.factions.filter(faction => activeFactions.includes(faction));
              dispatch(updateActiveFactions(commonFactions));
              
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
            dispatch(addCardToCoveredSlot({ card, slotIndex: index }));
            
            dispatch(coverCard({ slotIndex: index, cardId }));
            dispatch(removeActiveCard(cardId));
            defendSlot.classList.remove('defend-highlight');
          }
        }
      }
    } catch (error) {
      console.error('Error in handleMouseUp:', error);
    }

    setIsDragging(false);
    setIsOverReverseSlot(false);
    
    try {
      // Убираем подсветку со всех слотов и карт
      document.querySelectorAll('.slot.highlight, .slot.defend-highlight, .slot.reverse-highlight, .slot.faction-connect-highlight, .covered-card-image.faction-connect-highlight').forEach(s => {
        s.classList.remove('highlight');
        s.classList.remove('defend-highlight');
        s.classList.remove('reverse-highlight');
        s.classList.remove('faction-connect-highlight');
      });
    } catch (error) {
      console.error('Error cleaning up highlights in handleMouseUp:', error);
    }
  };

  // Обработчик для окончания касания сенсорного экрана
  const handleTouchEnd = () => {
    handleMouseUp(); // Используем ту же логику, что и для мыши
  };

  useEffect(() => {
    if (isDragging) {
      // События мыши
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      // События сенсорного экрана
      window.addEventListener('touchmove', handleTouchMove as EventListener);
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchcancel', handleTouchEnd);
    }
    
    return () => {
      // Удаляем события мыши
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      // Удаляем события сенсорного экрана
      window.removeEventListener('touchmove', handleTouchMove as EventListener);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isDragging, mode, connectionTarget, isOverReverseSlot, activeFactions, hasActiveFactionsInCard]);
  
  // Добавляем отдельный useEffect для очистки обработчиков при размонтировании компонента
  useEffect(() => {
    // Функция очистки при размонтировании компонента
    return () => {
      // Очищаем все обработчики событий
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove as EventListener);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      
      // Безопасная очистка DOM-элементов - проверяем существование элементов перед манипуляцией
      try {
        // Удаляем подсветку со всех элементов
        const elementsToCleanup = document.querySelectorAll('.slot.highlight, .slot.defend-highlight, .slot.reverse-highlight, .slot.faction-connect-highlight, .covered-card-image.faction-connect-highlight');
        elementsToCleanup.forEach(s => {
          if (document.body.contains(s)) {
            s.classList.remove('highlight');
            s.classList.remove('defend-highlight');
            s.classList.remove('reverse-highlight');
            s.classList.remove('faction-connect-highlight');
          }
        });
        
        // Если карта находится в слоте, но компонент размонтирован - убираем карту
        if (isInSlot && slotIndex !== null && cardRef.current) {
          const slot = document.querySelector(`[data-slot-index="${slotIndex}"]`);
          const wrapper = cardRef.current.parentElement;
          
          if (slot && wrapper && document.body.contains(wrapper)) {
            wrapper.remove();
          }
        }
      } catch (error) {
        console.error('Error cleaning up card DOM elements:', error);
      }
    };
  }, [isInSlot, slotIndex]);
  
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
        onTouchStart={handleTouchStart}
        draggable={false}
      />
    </div>
  );
};

export default Card;