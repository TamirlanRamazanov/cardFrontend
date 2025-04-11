import React, { useEffect, useState } from 'react';
import { factionManager } from '../../services/factionManager';
import { FACTIONS } from '../../constants/cards';
import './ActiveFactions.css';

const ActiveFactions: React.FC = () => {
  const [activeFactions, setActiveFactions] = useState<number[]>([]);

  // Обновляем активные фракции каждые 500 мс
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFactions(factionManager.getActiveFactions());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Если нет активных фракций, ничего не показываем
  if (activeFactions.length === 0) {
    return null;
  }

  return (
    <div className="active-factions-container">
      <h4>Active Factions:</h4>
      <ul className="active-factions-list">
        {activeFactions.map((factionId) => (
          <li key={factionId} className="faction-item">
            {FACTIONS[factionId]}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActiveFactions; 