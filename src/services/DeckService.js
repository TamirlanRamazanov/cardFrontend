import { CARDS_DATA, getCardById, getCardsByFaction } from '../constants/cards';

class DeckService {
  constructor() {
    this.deck = [...CARDS_DATA];
    this.activeCards = [];
    this.discardPile = [];
    this.shuffle();
  }

  getAllCards() {
    return this.deck;
  }

  getCardById(id) {
    return getCardById(id);
  }

  shuffle() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  drawCard() {
    if (this.deck.length === 0) {
      console.log('Deck is empty');
      return null;
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
    this.shuffle();
  }

  getCardsByFaction(factionId) {
    return getCardsByFaction(factionId);
  }
}

export const deckService = new DeckService(); 