import { create } from 'zustand';
import { deckService } from './DeckService';

const useGameStore = create((set, get) => ({
  // Состояние игры
  mode: 'attack', // 'attack' или 'defend'
  activeCards: [],
  occupiedSlots: 0,
  coveredCards: {}, // Объект, где ключ - индекс слота, значение - id карты, которая покрывает
  
  // Действия
  setMode: (mode) => set({ mode }),
  toggleMode: () => set((state) => ({ 
    mode: state.mode === 'attack' ? 'defend' : 'attack' 
  })),
  
  addCard: (card) => set((state) => ({ 
    activeCards: [...state.activeCards, card] 
  })),
  
  incrementOccupiedSlots: () => set((state) => ({ 
    occupiedSlots: Math.min(state.occupiedSlots + 1, 6) 
  })),
  
  coverCard: (slotIndex, cardId) => set((state) => {
    // Проверяем, не занят ли уже этот слот для покрытия
    if (state.coveredCards[slotIndex]) {
      return state; // Если слот уже занят, ничего не делаем
    }
    
    return {
      coveredCards: {
        ...state.coveredCards,
        [slotIndex]: cardId
      }
    };
  }),
  
  // Вспомогательные функции
  hasCoveredCards: () => Object.keys(get().coveredCards).length > 0,
  
  isSlotCovered: (slotIndex) => !!get().coveredCards[slotIndex],
  
  getCardById: (cardId) => deckService.getCardById(cardId),
  
  // Удаление карты из активных
  removeActiveCard: (cardId) => set((state) => ({
    activeCards: state.activeCards.filter(card => card.id !== cardId)
  })),
}));

export default useGameStore;