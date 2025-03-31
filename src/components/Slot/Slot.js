import React from 'react';
import './Slot.css';

const Slot = ({ isOccupied, className, slotIndex }) => {
    return (
        <div
            className={`slot ${isOccupied ? 'occupied' : ''} ${className || ''}`}
            data-slot="true"
            data-slot-index={slotIndex}
        >
            <div className="slot-inner"></div>
        </div>
    );
};

export default Slot;