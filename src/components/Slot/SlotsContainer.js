import React, { useState, useEffect } from 'react';
import Slot from './Slot';
import './Slot.css';

const MAX_SLOTS = 6;

const SlotsContainer = ({ occupiedSlots, mode }) => {
  const [visibleSlots, setVisibleSlots] = useState(1);

  useEffect(() => {
    // В режиме атаки показываем новый слот, когда предыдущий занят
    if (mode === 'attack') {
      if (occupiedSlots > 0 && occupiedSlots < MAX_SLOTS) {
        setVisibleSlots(occupiedSlots + 1);
      } else if (occupiedSlots === 0) {
        setVisibleSlots(1);
      }
    } else {
      // В режиме защиты показываем только занятые слоты
      setVisibleSlots(occupiedSlots);
    }
  }, [occupiedSlots, mode]);

  return (
    <div className="slots-container">
      {[...Array(visibleSlots)].map((_, index) => (
        <Slot
          key={index}
          isOccupied={index < occupiedSlots}
          className={`slot ${index === visibleSlots - 1 && mode === 'attack' ? 'new-slot' : ''}`}
          data-slot="true"
        />
      ))}
    </div>
  );
};

export default SlotsContainer;