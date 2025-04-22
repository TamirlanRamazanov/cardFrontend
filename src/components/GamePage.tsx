import React from 'react';
import Card from './Card';
import Table from './Table';
import { SlotsContainer } from './Slot';
import { ActiveFactions } from './ActiveFactions';
import { deckService } from '../services/DeckService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  addCard, 
  incrementOccupiedSlots, 
  toggleMode, 
  selectMode, 
  selectActiveCards, 
  selectOccupiedSlots,
  resetTable
} from '../store/slices/gameSlice';
import { Card as CardType } from '../services/DeckService';
import { logoutUser, selectUser } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { resetFactions } from '../store/slices/factionSlice';

const GamePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const mode = useAppSelector(selectMode);
  const activeCards = useAppSelector(selectActiveCards);
  const occupiedSlots = useAppSelector(selectOccupiedSlots);
  const user = useAppSelector(selectUser);
  
  const handleDrawCard = () => {
    try {
      const newCard = deckService.drawCard();
      if (newCard) {
        dispatch(addCard(newCard));
      }
    } catch (error) {
      console.error('Error drawing card:', error);
    }
  };

  const handleToggleMode = () => {
    dispatch(toggleMode());
  };

  const handleIncrementOccupiedSlots = () => {
    dispatch(incrementOccupiedSlots());
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const handleResetTable = () => {
    // Фаза 1: Подготавливаем DOM перед обновлением состояния
    
    // Удаляем подсветку со всех слотов и карт
    document.querySelectorAll('.slot.highlight, .slot.defend-highlight, .slot.reverse-highlight, .slot.faction-connect-highlight, .covered-card-image.faction-connect-highlight').forEach(s => {
      s.classList.remove('highlight');
      s.classList.remove('defend-highlight');
      s.classList.remove('reverse-highlight');
      s.classList.remove('faction-connect-highlight');
    });
    
    // Очищаем occupied классы со слотов
    document.querySelectorAll('.slot.occupied').forEach(s => {
      s.classList.remove('occupied');
    });
    
    // Удаляем все карты из слотов
    document.querySelectorAll('.slot .card-wrapper').forEach(card => {
      // Удаляем карту из слота и возвращаем её в исходное положение
      card.remove();
    });
    
    // Удаляем все карты из covered-slots
    document.querySelectorAll('.covered-slot .covered-card-image').forEach(card => {
      card.remove();
    });
    
    // Фаза 2: Используем setTimeout с большим интервалом для обновления Redux
    // Даем React достаточно времени для очистки DOM перед изменением состояния
    setTimeout(() => {
      dispatch(resetTable());
      
      // Фаза 3: Дополнительная очистка после обновления Redux
      setTimeout(() => {
        dispatch(resetFactions());
      }, 50);
    }, 100);
  };

  return (
    <div className="container">
      <div className="header">
        <div className="user-info">
          Привет, <span className="user-name">{user?.name || 'Игрок'}</span>
        </div>
        <div className="header-buttons">
          <button className="draw-button" onClick={handleDrawCard}>
            Draw Card
          </button>
          <button 
            className={`action-button ${mode}`}
            onClick={handleToggleMode}
          >
            {mode === 'attack' ? 'Attack' : 'Defend'}
          </button>
          <button className="reset-button" onClick={handleResetTable}>
            Reset Table
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Leave
          </button>
        </div>
      </div>
      <ActiveFactions />
      <Table>
        <SlotsContainer 
          occupiedSlots={occupiedSlots} 
          mode={mode}
        />
      </Table>
        {activeCards.map((card: CardType, index: number) => (
          <Card 
            key={card.id} 
            cardId={card.id} 
            index={index}
            onPlaced={handleIncrementOccupiedSlots}
          />
        ))}
    </div>
  );
};

export default GamePage; 