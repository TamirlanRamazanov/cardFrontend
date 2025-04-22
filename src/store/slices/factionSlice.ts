import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Card } from '../../services/DeckService';
import { deckService } from '../../services/DeckService';
import { RootState } from '../index';
import { FACTIONS } from '../../constants/cards';

interface FactionState {
  activeFactions: number[];
  mainSlotCards: { [slotIndex: number]: number }; // ID карты в каждом слоте
  coveredSlotCards: { [slotIndex: number]: number }; // ID карты в каждом покрытом слоте
}

const initialState: FactionState = {
  activeFactions: [],
  mainSlotCards: {},
  coveredSlotCards: {},
};

export const factionSlice = createSlice({
  name: 'faction',
  initialState,
  reducers: {
    // Обновление активных фракций
    updateActiveFactions: (state: FactionState, action: PayloadAction<number[]>) => {
      state.activeFactions = action.payload;
    },
    
    // Добавление карты в основной слот
    addCardToMainSlot: (state: FactionState, action: PayloadAction<{ card: Card, slotIndex: number }>) => {
      const { card, slotIndex } = action.payload;
      state.mainSlotCards[slotIndex] = card.id;
      
      // Если нет активных фракций, делаем все фракции карты активными
      if (state.activeFactions.length === 0) {
        state.activeFactions = [...card.factions];
      }
    },
    
    // Добавление карты в покрытый слот
    addCardToCoveredSlot: (state: FactionState, action: PayloadAction<{ card: Card, slotIndex: number }>) => {
      const { card, slotIndex } = action.payload;
      state.coveredSlotCards[slotIndex] = card.id;
      
      // Добавляем все фракции карты в активные фракции (если они ещё не добавлены)
      card.factions.forEach((faction: number) => {
        if (!state.activeFactions.includes(faction)) {
          state.activeFactions.push(faction);
        }
      });
    },
    
    // Обновление фракций при соединении карт
    updateFactionsOnConnection: (state: FactionState, action: PayloadAction<{ newCard: Card, existingCardId: number }>) => {
      const { newCard, existingCardId } = action.payload;
      const existingCard = deckService.getCardById(existingCardId);
      
      if (!existingCard) return;
      
      // Находим общие фракции
      const commonFactions = newCard.factions.filter((faction: number) => 
        existingCard.factions.includes(faction)
      );
      
      if (commonFactions.length === 0) return;
      
      // Создаем буферную структуру для активных фракций
      const bufferActiveFactions = [...commonFactions];
      
      // Оставляем все прежние активные фракции, которые не затрагиваются этим соединением
      state.activeFactions.forEach((faction: number) => {
        if (!newCard.factions.includes(faction) && !existingCard.factions.includes(faction)) {
          if (!bufferActiveFactions.includes(faction)) {
            bufferActiveFactions.push(faction);
          }
        }
      });
      
      // Обновляем активные фракции
      state.activeFactions = bufferActiveFactions;
    },
    
    // Сброс состояния
    resetFactions: (state: FactionState) => {
      state.activeFactions = [];
      state.mainSlotCards = {};
      state.coveredSlotCards = {};
    },
  },
});

// Экспорт actions
export const {
  updateActiveFactions,
  addCardToMainSlot,
  addCardToCoveredSlot,
  updateFactionsOnConnection,
  resetFactions,
} = factionSlice.actions;

// Селекторы
export const selectActiveFactions = (state: RootState) => state.faction.activeFactions;
export const selectMainSlotCards = (state: RootState) => state.faction.mainSlotCards;
export const selectCoveredSlotCards = (state: RootState) => state.faction.coveredSlotCards;

// Вспомогательные селекторы
export const selectHasActiveFactionsInCard = (state: RootState, card: Card) => {
  const { activeFactions } = state.faction;
  
  if (activeFactions.length === 0) {
    return true; // Если нет активных фракций, то первая карта всегда проходит
  }
  
  return card.factions.some(faction => activeFactions.includes(faction));
};

export const selectCanConnectCards = (state: RootState, newCard: Card, existingCardId: number) => {
  const existingCard = deckService.getCardById(existingCardId);
  
  if (!existingCard) return null;
  
  // Находим общие фракции
  const commonFactions = newCard.factions.filter(faction => 
    existingCard.factions.includes(faction)
  );
  
  return commonFactions.length > 0 ? commonFactions : null;
};

export const selectShouldHighlightForConnection = (state: RootState, newCard: Card, existingCardId: number) => {
  return selectCanConnectCards(state, newCard, existingCardId) !== null;
};

export const selectCanAddCardToMainSlotInDefendMode = (state: RootState, card: Card) => {
  const { mainSlotCards, activeFactions } = state.faction;
  
  if (Object.keys(mainSlotCards).length === 0) {
    return false; // В режиме defend нельзя добавить первую карту в main slot
  }
  
  // Для каждой карты в main slots
  for (const slotIndex in mainSlotCards) {
    const cardId = mainSlotCards[slotIndex];
    
    // Если карта с таким ID не находится в mainSlotCards, пропускаем её
    if (!cardId) continue;
    
    // Проверяем, есть ли у новой карты хотя бы одна общая фракция с активными фракциями
    const hasCommonFaction = activeFactions.some((faction: number) => 
      card.factions.includes(faction)
    );
    
    if (!hasCommonFaction) {
      return false;
    }
  }
  
  return true;
};

// Вспомогательная функция для получения имени фракции (не селектор)
export const getFactionNameHelper = (factionId: number) => {
  return FACTIONS[factionId] || `Unknown Faction (${factionId})`;
};

export default factionSlice.reducer; 