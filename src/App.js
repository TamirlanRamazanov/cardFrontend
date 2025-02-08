import React from 'react';
import './App.css';
import cardImage from './assets/cards/PrimeRayleigh.png'

function App() {
  return (
    <div className="container">
      <img src={cardImage} alt='Card' className='card-image' />
    </div>
  );
}

export default App; 