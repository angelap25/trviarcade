import React from 'react';

export default function SelectPlayers({ onChoose = () => {}, onBack = () => {} }) {
  return (
    <div className="select-players">
      <h3>¿Cuántos juegan?</h3>
      <div className="btn-row">
        <button className="btn" onClick={() => onChoose(1)}>1 JUGADOR</button>
        <button className="btn" onClick={() => onChoose(2)}>2 JUGADORES</button>
      </div>
      <button className="btn btn-secondary" onClick={onBack}>Volver</button>
    </div>
  );
}
