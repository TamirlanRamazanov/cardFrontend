import { CARDS_DATA, getCardById, getCardsByFaction } from '../constants/cards';

export interface Card {
  id: number;
  name: string;
  power: number;
  factions: number[];
  image: string;
}

class DeckService {
  private deck: Card[];
  private activeCards: Card[];
  private discardPile: Card[];

  constructor() {
    this.deck = [...CARDS_DATA];
    this.activeCards = [];
    this.discardPile = [];
    this.shuffle();
  }

  getAllCards(): Card[] {
    return this.deck;
  }

  getCardById(id: number): Card | undefined {
    return getCardById(id);
  }

  shuffle(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  drawCard(): Card | null {
    if (this.deck.length === 0) {
      console.log('Deck is empty');
      return null;
    }
    const card = this.deck.pop();
    if (card) {
      this.activeCards.push(card);
      return card;
    }
    return null;
  }

  discardCard(cardId: number): void {
    const cardIndex = this.activeCards.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
      const [card] = this.activeCards.splice(cardIndex, 1);
      this.discardPile.push(card);
    }
  }

  resetDeck(): void {
    this.deck = [...CARDS_DATA];
    this.activeCards = [];
    this.discardPile = [];
    this.shuffle();
  }

  getCardsByFaction(factionId: number): Card[] {
    return getCardsByFaction(factionId);
  }
}

export const deckService = new DeckService(); 