import React from 'react';
import { FACTIONS } from '../../constants/cards';
import './ActiveFactions.css';
import { useAppSelector } from '../../store/hooks';
import { selectActiveFactions } from '../../store/slices/factionSlice';

const ActiveFactions: React.FC = () => {
  const activeFactions = useAppSelector(selectActiveFactions);

  if (activeFactions.length === 0) {
    return null;
  }

  return (
    <div className="active-factions-container">
      <h4>Active Factions:</h4>
      <ul className="active-factions-list">
        {activeFactions.map((factionId: number) => (
          <li key={factionId} className="faction-item">
            {FACTIONS[factionId]}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActiveFactions; 