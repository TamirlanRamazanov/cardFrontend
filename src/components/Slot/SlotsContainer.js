import React, { useState, useEffect } from 'react';
import Slot from './Slot';
import useGameStore from '../../services/gameStore';
import './Slot.css';
import { deckService } from '../../services/DeckService';

const MAX_SLOTS = 6;

const SlotsContainer = ({ occupiedSlots, mode }) => {
  const [visibleSlots, setVisibleSlots] = useState(1);
  const coveredCards = useGameStore(state => state.coveredCards);
  
  // Проверяем, есть ли покрытые карты
  const hasCoveredCards = Object.keys(coveredCards).length > 0;

  useEffect(() => {
    // В режиме атаки показываем новый слот, когда предыдущий занят
    if (mode === 'attack') {
      if (occupiedSlots > 0 && occupiedSlots < MAX_SLOTS) {
        setVisibleSlots(occupiedSlots + 1);
      } else if (occupiedSlots === 0) {
        setVisibleSlots(1);
      }
    } else {
      // В режиме защиты показываем только занятые слоты
      setVisibleSlots(occupiedSlots);
    }
  }, [occupiedSlots, mode]);

  // Отладочная информация
  console.log("Covered cards:", coveredCards);
  console.log("Has covered cards:", hasCoveredCards);

  return (
    <div className={`slots-container ${hasCoveredCards ? 'has-covered-cards-visible' : ''}`}>
      {/* Основные слоты для карт */}
      <div className="main-slots">
        {[...Array(visibleSlots)].map((_, index) => (
          <Slot
            key={index}
            isOccupied={index < occupiedSlots}
            className={`slot ${index === visibleSlots - 1 && mode === 'attack' ? 'new-slot' : ''}`}
            slotIndex={index}
          />
        ))}
      </div>
      
      {/* Слоты для покрытых карт */}
      <div className="covered-slots">
        {[...Array(MAX_SLOTS)].map((_, index) => {
          const cardId = coveredCards[index];
          const card = cardId ? deckService.getCardById(cardId) : null;

          // Условие для добавления пустого слота в режиме атаки
          const isEmptySlot = mode === 'attack' && index === visibleSlots - 1 && occupiedSlots < MAX_SLOTS;

          // Условие для отображения слотов защиты
          const isVisibleCoveredSlot = mode === 'defend' ? index < occupiedSlots : index < visibleSlots;

          return (
            <div 
              key={`covered-slot-${index}`} 
              className="covered-slot"
              data-covered-slot-index={index}
              style={{ display: isVisibleCoveredSlot ? 'flex' : 'none' }} // Используем display для управления видимостью
            >
              {isEmptySlot ? (
                <div className="empty-covered-slot"></div> // Пустой слот для выравнивания
              ) : card ? (
                <img
                  className="covered-card-image"
                  src={`${process.env.PUBLIC_URL}/assets/cards/${card.image}`}
                  alt={`Covered card ${card.name || index}`}
                />
              ) : (
                <div className="empty-covered-slot">
                  {mode === 'defend' && index < occupiedSlots && (
                    <span className="defend-hint"></span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SlotsContainer;