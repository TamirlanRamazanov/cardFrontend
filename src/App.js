import React, { useState } from 'react';
import './App.css';
import Card from './components/Card/Card';
import Table from './Table/Table';
import { deckService } from './services/DeckService';

function App() {
  const [activeCards, setActiveCards] = useState([]);
  
  const handleDrawCard = () => {
    try {
      const newCard = deckService.drawCard();
      console.log('Drawn card:', newCard);
      if (newCard) {
        setActiveCards(prev => [...prev, newCard]);
      } else {
        console.log('No more cards in the deck');
      }
    } catch (error) {
      console.error('Error drawing card:', error);
    }
  };

  console.log('Current active cards:', activeCards);

  return (
    <div className="container">
      <Table />
      {activeCards.map((card, index) => (
        <Card 
          key={card.id} 
          cardId={card.id} 
          index={index}
        />
      ))}
      <button 
        className="draw-button" 
        onClick={handleDrawCard}
      >
        Draw Card
      </button>
    </div>
  );
}

export default App; 