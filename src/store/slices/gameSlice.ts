import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Card } from '../../services/DeckService';
import { deckService } from '../../services/DeckService';
import { RootState } from '../index';

interface GameState {
  // Состояние игры
  mode: 'attack' | 'defend';
  activeCards: Card[];
  occupiedSlots: number;
  coveredCards: { [key: number]: number };
}

const initialState: GameState = {
  mode: 'attack',
  activeCards: [],
  occupiedSlots: 0,
  coveredCards: {},
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Установка режима
    setMode: (state: GameState, action: PayloadAction<'attack' | 'defend'>) => {
      state.mode = action.payload;
    },
    
    // Периключение режима
    toggleMode: (state: GameState) => {
      state.mode = state.mode === 'attack' ? 'defend' : 'attack';
    },
    
    // Добавление карт
    addCard: (state: GameState, action: PayloadAction<Card>) => {
      state.activeCards.push(action.payload);
    },
    
    incrementOccupiedSlots: (state: GameState) => {
      state.occupiedSlots = Math.min(state.occupiedSlots + 1, 6);
    },
    
    // Покрытие карты
    coverCard: (state: GameState, action: PayloadAction<{ slotIndex: number, cardId: number }>) => {
      const { slotIndex, cardId } = action.payload;
      // Проверяем, не занят ли уже этот слот для покрытия
      if (state.coveredCards[slotIndex]) {
        return;
      }
      
      state.coveredCards[slotIndex] = cardId;
    },
    
    // Удаление активной карты
    removeActiveCard: (state: GameState, action: PayloadAction<number>) => {
      state.activeCards = state.activeCards.filter((card: Card) => card.id !== action.payload);
    },
    
    resetTable: (state: GameState) => {
      state.activeCards = [];
      state.occupiedSlots = 0;
      state.coveredCards = {};
      state.mode = 'attack';
    },
  },
});

// Экспорт actions
export const { 
  setMode, 
  toggleMode, 
  addCard, 
  incrementOccupiedSlots, 
  coverCard, 
  removeActiveCard,
  resetTable
} = gameSlice.actions;

// Селекторы
export const selectMode = (state: RootState) => state.game.mode;
export const selectActiveCards = (state: RootState) => state.game.activeCards;
export const selectOccupiedSlots = (state: RootState) => state.game.occupiedSlots;
export const selectCoveredCards = (state: RootState) => state.game.coveredCards;

// Вспомогательные селекторы
export const selectHasCoveredCards = (state: RootState) => 
  Object.keys(state.game.coveredCards).length > 0;

export const selectIsSlotCovered = (state: RootState, slotIndex: number) => 
  !!state.game.coveredCards[slotIndex];

export const selectCanPlaceCardInDefendMode = (state: RootState) => {
  const { mode, occupiedSlots, coveredCards } = state.game;
  const hasCoveredCards = Object.values(coveredCards).some(cardId => cardId !== undefined);
  return mode === 'defend' && occupiedSlots > 0 && !hasCoveredCards;
};

export const selectHasEmptyMainSlots = (state: RootState) => 
  state.game.occupiedSlots < 6;

export const getCardByIdHelper = (cardId: number) => 
  deckService.getCardById(cardId);

export default gameSlice.reducer; 