import React from 'react';
import { deckService } from '../../services/DeckService';
import useGameStore from '../../services/gameStore';
import './CoveredCards.css';

const CoveredCardsContainer = () => {
  const coveredCards = useGameStore(state => state.coveredCards);
  
  // Проверяем, есть ли покрытые карты
  const hasCoveredCards = Object.keys(coveredCards).length > 0;
  
  if (!hasCoveredCards) return null;
  
  // Создаем массив из 6 элементов для слотов
  const slots = Array(6).fill(null);
  
  return (
    <div className="covered-cards-container">
      {slots.map((_, index) => {
        const cardId = coveredCards[index];
        
        if (!cardId) {
          // Возвращаем пустой div для сохранения структуры
          return <div key={`placeholder-${index}`} className="covered-card-placeholder"></div>;
        }
        
        const card = deckService.getCardById(cardId);
        
        // Проверяем, что карта существует
        if (!card) {
          return <div key={`error-${index}`} className="covered-card-placeholder"></div>;
        }
        
        return (
          <div key={`covered-${index}`} className="covered-card-slot">
            <img
              className="covered-card-image"
              src={`${process.env.PUBLIC_URL}/assets/cards/${card.image}`}
              alt={`Covered card ${index}`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default CoveredCardsContainer;