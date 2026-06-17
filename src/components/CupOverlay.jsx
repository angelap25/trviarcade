import React from 'react';

export function CupOverlay({ cupWinner = null, players = [], onContinue = () => {} }) {
  if (cupWinner === null || cupWinner === undefined) return null;
  const name = players[cupWinner] || `Jugador ${cupWinner + 1}`;
  return (
    <div className="cup-overlay">
      <div className="cup-content">
        <div className="cup-icon">🏆</div>
        <div className="cup-text">¡{name} ganó la Copa del Mundo!</div>
        <button className="btn" onClick={onContinue} style={{ marginTop: 12 }}>Continuar</button>
      </div>
    </div>
  );
}

export default CupOverlay;
