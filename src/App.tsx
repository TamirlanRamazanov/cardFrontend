import React from 'react';
import './App.css';
import Card from './components/Card';
import Table from './components/Table';
import { SlotsContainer } from './components/Slot';
import { deckService } from './services/DeckService';
import useGameStore from './services/gameStore';

function App() {
  const { 
    mode, 
    activeCards, 
    occupiedSlots, 
    toggleMode, 
    addCard, 
    incrementOccupiedSlots 
  } = useGameStore();
  
  const handleDrawCard = () => {
    try {
      const newCard = deckService.drawCard();
      if (newCard) {
        addCard(newCard);
      }
    } catch (error) {
      console.error('Error drawing card:', error);
    }
  };

  return (
    <div className="container">
      <Table>
        <SlotsContainer 
          occupiedSlots={occupiedSlots} 
          mode={mode}
        />
      </Table>
        {activeCards.map((card: any, index: number) => (
          <Card 
            key={card.id} 
            cardId={card.id} 
            index={index}
            onPlaced={incrementOccupiedSlots}
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