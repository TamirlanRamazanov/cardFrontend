import { create } from 'zustand';

const useGameStore = create((set) => ({
  // Состояние игры
  mode: 'attack', // 'attack' или 'defend'
  activeCards: [],
  occupiedSlots: 0,
  
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
}));

export default useGameStore;