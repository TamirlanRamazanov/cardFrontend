import React, { useState } from 'react';
import './App.css';
import Card from './components/Card';
import { deckService } from './services/DeckService';

function App() {
  const [activeCards, setActiveCards] = useState([]);

  const handleDrawCard = () => {
    const newCard = deckService.drawCard();
    setActiveCards(prev => [...prev, newCard]);
  };

  return (
    <div className="container">
      {activeCards.map(card => (
        <Card key={card.id} cardId={card.id} />
      ))}
      <button onClick={handleDrawCard}>Draw Card</button>
    </div>
  );
}

export default App; 