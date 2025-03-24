import { CARDS_DATA, getCardById, getCardsByFaction } from '../constants/cards';

class DeckService {
  constructor() {
    this.deck = [...CARDS_DATA];
    this.activeCards = [];
    this.discardPile = [];
  }

  getAllCards() {
    return this.deck;
  }

  getCardById(id) {
    return getCardById(id);
  }

  shuffleDeck() {
    this.deck = [...this.deck].sort(() => Math.random() - 0.5);
    return this.deck;
  }

  drawCard() {
    if (this.deck.length === 0) {
      // Если колода пуста, перемешиваем сброс
      this.deck = this.shuffleDeck([...this.discardPile]);
      this.discardPile = [];
    }
    const card = this.deck.pop();
    this.activeCards.push(card);
    return card;
  }

  discardCard(cardId) {
    const cardIndex = this.activeCards.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
      const [card] = this.activeCards.splice(cardIndex, 1);
      this.discardPile.push(card);
    }
  }

  resetDeck() {
    this.deck = [...CARDS_DATA];
    this.activeCards = [];
    this.discardPile = [];
    this.shuffleDeck();
  }

  getCardsByFaction(factionId) {
    return getCardsByFaction(factionId);
  }
}

export const deckService = new DeckService(); 