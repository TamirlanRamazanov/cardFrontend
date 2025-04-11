import { Card } from './DeckService';
import { deckService } from './DeckService';
import { FACTIONS } from '../constants/cards';

interface FactionManagerState {
  activeFactions: number[];       // Активные фракции на столе
  mainSlotCards: Map<number, number>; // Карты в main slots: ключ - индекс слота, значение - ID карты
  coveredSlotCards: Map<number, number>; // Карты в covered slots: ключ - индекс слота, значение - ID карты
}

class FactionManager {
  private state: FactionManagerState;
  private static instance: FactionManager;

  private constructor() {
    this.state = {
      activeFactions: [],
      mainSlotCards: new Map(),
      coveredSlotCards: new Map()
    };
  }

  public static getInstance(): FactionManager {
    if (!FactionManager.instance) {
      FactionManager.instance = new FactionManager();
    }
    return FactionManager.instance;
  }

  /**
   * Получить активные фракции
   */
  public getActiveFactions(): number[] {
    return [...this.state.activeFactions];
  }

  /**
   * Получить имя фракции по ID
   */
  public getFactionName(factionId: number): string {
    return FACTIONS[factionId] || `Unknown Faction (${factionId})`;
  }

  /**
   * Проверяет, есть ли у карты хотя бы одна активная фракция
   */
  public hasActiveFactionsInCard(card: Card): boolean {
    if (this.state.activeFactions.length === 0) {
      return true; // Если нет активных фракций, то первая карта всегда проходит
    }
    return card.factions.some(faction => this.state.activeFactions.includes(faction));
  }

  /**
   * Добавляет карту в main slot и обновляет активные фракции
   */
  public addCardToMainSlot(card: Card, slotIndex: number): void {
    this.state.mainSlotCards.set(slotIndex, card.id);
    
    if (this.state.activeFactions.length === 0) {
      // Если это первая карта, все её фракции становятся активными
      this.state.activeFactions = [...card.factions];
    }
  }

  /**
   * Добавляет карту в covered slot и делает все её фракции активными
   */
  public addCardToCoveredSlot(card: Card, slotIndex: number): void {
    this.state.coveredSlotCards.set(slotIndex, card.id);
    
    // Добавляем все фракции карты в активные фракции (если они ещё не добавлены)
    card.factions.forEach(faction => {
      if (!this.state.activeFactions.includes(faction)) {
        this.state.activeFactions.push(faction);
      }
    });
  }

  /**
   * Проверяет, можно ли добавить карту в main slot в режиме defend
   * Карта должна иметь хотя бы одну фракцию, активную для каждой карты в main slots
   */
  public canAddCardToMainSlotInDefendMode(card: Card): boolean {
    if (this.state.mainSlotCards.size === 0) {
      return false; // В режиме defend нельзя добавить первую карту в main slot
    }
    
    // Для каждой карты в main slots
    const cardIds = Array.from(this.state.mainSlotCards.values());
    for (const cardId of cardIds) {
      // Если карта с таким ID не находится в mainSlotCards, пропускаем её
      if (!cardId) continue;
      
      // Проверяем, есть ли у новой карты хотя бы одна общая фракция с текущей картой
      const hasCommonFaction = this.state.activeFactions.some(faction => 
        card.factions.includes(faction)
      );
      
      if (!hasCommonFaction) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Проверяет возможность соединения новой карты с существующей по фракциям
   * Возвращает общие фракции или null, если соединение невозможно
   */
  public canConnectCards(newCard: Card, existingCardId: number): number[] | null {
    // Получаем фракции существующей карты
    const existingCard = this.getCardById(existingCardId);
    if (!existingCard) return null;
    
    // Находим общие фракции
    const commonFactions = newCard.factions.filter(faction => 
      existingCard.factions.includes(faction)
    );
    
    return commonFactions.length > 0 ? commonFactions : null;
  }

  /**
   * Обновляет активные фракции при соединении карт
   * Создает буферную структуру, которая сохраняет только общие фракции
   */
  public updateFactionsOnConnection(newCard: Card, existingCardId: number): boolean {
    const commonFactions = this.canConnectCards(newCard, existingCardId);
    if (!commonFactions) return false;
    
    // Создаем буферную структуру для активных фракций
    const bufferActiveFactions = commonFactions;
    
    // Оставляем все прежние активные фракции, которые не затрагиваются этим соединением
    this.state.activeFactions.forEach(faction => {
      if (!newCard.factions.includes(faction) && 
          !this.getCardById(existingCardId)?.factions.includes(faction)) {
        if (!bufferActiveFactions.includes(faction)) {
          bufferActiveFactions.push(faction);
        }
      }
    });
    
    // Обновляем активные фракции
    this.state.activeFactions = bufferActiveFactions;
    return true;
  }

  /**
   * Проверяет, подсвечивать ли карту фиолетовой аурой для соединения
   */
  public shouldHighlightForConnection(newCard: Card, existingCardId: number): boolean {
    return this.canConnectCards(newCard, existingCardId) !== null;
  }
  
  /**
   * Вспомогательный метод для получения карты по ID
   */
  private getCardById(cardId: number): Card | null {
    const card = deckService.getCardById(cardId);
    return card || null;
  }

  /**
   * Очистить все данные
   */
  public reset(): void {
    this.state.activeFactions = [];
    this.state.mainSlotCards.clear();
    this.state.coveredSlotCards.clear();
  }
}

export const factionManager = FactionManager.getInstance();