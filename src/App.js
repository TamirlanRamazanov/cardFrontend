import React, { useState } from 'react';
import './App.css';
import Card from './components/Card/Card';
import Table from './Table/Table';
import SlotsContainer from './components/Slot/SlotsContainer';
import { deckService } from './services/DeckService';

function App() {
  const [mode, setMode] = useState('attack');
  const [activeCards, setActiveCards] = useState([]);
  const [occupiedSlots, setOccupiedSlots] = useState(0);
  
  const handleDrawCard = () => {
    try {
      const newCard = deckService.drawCard();
      if (newCard) {
        setActiveCards(prev => [...prev, newCard]);
      }
    } catch (error) {
      console.error('Error drawing card:', error);
    }
  };

  const handleCardPlaced = () => {
    setOccupiedSlots(prev => Math.min(prev + 1, 6));
  };

  const toggleMode = () => {
    setMode(mode === 'attack' ? 'defend' : 'attack');
  };

  return (
    <div className="container">
      <Table />
      <SlotsContainer occupiedSlots={occupiedSlots} />
      {activeCards.map((card, index) => (
        <Card 
          key={card.id} 
          cardId={card.id} 
          index={index}
          onPlaced={handleCardPlaced}
        />
      ))}
      <div className="buttons-container">
        <button className="draw-button" onClick={handleDrawCard}>
          Draw Card
        </button>
        <button 
          className={`action-button ${mode}`}
          onClick={toggleMode}
        >
          {mode === 'attack' ? 'Attack' : 'Defend'}
        </button>
      </div>
    </div>
  );
}

export default App; 