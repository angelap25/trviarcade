import React, { useState } from 'react';

export default function SetupNames({ numPlayers = 2, onConfirm = () => {}, onBack = () => {} }) {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  return (
    <div className="setup-names">
      <h3>Antes de empezar</h3>
      <input id="player1" name="player1" placeholder="Jugador 1" value={p1} onChange={e => setP1(e.target.value)} />
      {numPlayers === 2 && <input id="player2" name="player2" placeholder="Jugador 2" value={p2} onChange={e => setP2(e.target.value)} />}
      <div className="btn-row">
        <button className="btn btn-secondary" onClick={onBack}>Volver</button>
        <button className="btn" onClick={() => onConfirm(p1, p2)}>Empezar</button>
      </div>
    </div>
  );
}
