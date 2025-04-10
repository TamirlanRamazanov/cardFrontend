import React from 'react';
import useGameStore from '../../services/gameStore';
import './Slot.css';

interface SlotProps {
    isOccupied: boolean;
    className?: string;
    slotIndex: number;
}

const Slot: React.FC<SlotProps> = ({ isOccupied, className, slotIndex }) => {
    const { mode } = useGameStore();
    
    // Определяем, является ли этот слот последним видимым в режиме защиты
    const isLastEmptySlotInDefendMode = mode === 'defend' && !isOccupied && 
        className && className.includes('new-slot');
    
    return (
        <div
            className={`slot ${isOccupied ? 'occupied' : ''} ${className || ''}`}
            data-slot="true"
            data-slot-index={slotIndex}
        >
            {isLastEmptySlotInDefendMode ? (
                <img 
                    src={`${process.env.PUBLIC_URL}/reverse-sign.png`}
                    alt="Reverse sign"
                    className="reverse-sign"
                />
            ) : (
                <div className="slot-inner"></div>
            )}
        </div>
    );
};

export default Slot;