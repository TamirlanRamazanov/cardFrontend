import React from 'react';
import './Slot.css';

const Slot = ({ isOccupied, className }) => {
    return (
        <div
            className={`slot ${isOccupied ? 'occupied' : ''} ${className || ''}`}
            data-slot="true"
        >
            <div className="slot-inner"></div>
        </div>
    );
};

export default Slot;