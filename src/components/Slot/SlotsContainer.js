import React, { useState, useEffect } from 'react';
import Slot from './Slot';
import './Slot.css';

const MAX_SLOTS = 6;

const SlotsContainer = ({ occupiedSlots }) => {
  const [visibleSlots, setVisibleSlots] = useState(1);

  useEffect(() => {
    // Показываем новый слот, когда предыдущий занят
    if (occupiedSlots > 0 && occupiedSlots < MAX_SLOTS) {
      setVisibleSlots(occupiedSlots + 1);
    }
  }, [occupiedSlots]);

  return (
    <div className="slots-container">
      {[...Array(visibleSlots)].map((_, index) => (
        <Slot
          key={index}
          isOccupied={index < occupiedSlots}
          className={`slot ${index === visibleSlots - 1 ? 'new-slot' : ''}`}
          data-slot="true"
        />
      ))}
    </div>
  );
};

export default SlotsContainer; 