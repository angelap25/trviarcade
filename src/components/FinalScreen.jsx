import React from 'react';

export default function FinalScreen({ players = [], scores = [], balls = [], onRestart = () => {}, onHome = () => {} }) {
  return (
    <div className="final-screen">
      <h2>Fin de la partida</h2>
      <div className="final-scores">
        {players.map((p, i) => (
          <div key={i} className="final-card">
            <div className="fname">{p}</div>
            <div className="fscore">{scores[i]}</div>
            <div className="fballs">⚽ {balls[i] ?? 0}</div>
          </div>
        ))}
      </div>
      <div className="btn-row">
        <button className="btn btn-secondary" onClick={onHome}>Menú</button>
        <button className="btn" onClick={onRestart}>Revancha</button>
      </div>
    </div>
  );
}
