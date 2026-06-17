import React from 'react';

export function BallToast({ toast = null, players = [] }) {
  if (!toast) return null;
  const playerName = players[toast.player] || `Jugador ${toast.player + 1}`;
  return (
    <div className="ball-toast-global">
      <div className="ball-toast-content">{playerName}: {toast.text}</div>
    </div>
  );
}

export default BallToast;
