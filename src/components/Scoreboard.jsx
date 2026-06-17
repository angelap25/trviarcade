import React from 'react';

export function Scoreboard({ players = [], scores = [], turn = 0, numPlayers = 2, balls = [], cupWinner = null }) {
  return (
    <div className="scoreboard">
      {players.map((name, idx) => (
        <div key={idx} className={`player-led ${idx === turn ? 'active' : ''}`}>
          <div className="pname">{name}</div>
          <div className="pscore">{scores[idx] ?? 0}</div>
          <div className="pballs">⚽ {balls[idx] ?? 0}{cupWinner === idx ? ' 🏆' : ''}</div>
        </div>
      ))}
    </div>
  );
}

export default Scoreboard;
