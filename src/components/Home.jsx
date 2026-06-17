import React from 'react';

export default function Home({ onPickMode = () => {} }) {
  return (
    <div className="home-screen">
      <h2>TRIVIA MUNDIALISTA</h2>
      <p>Seleccioná un modo y a jugar</p>
      <div className="mode-grid">
        <button className="btn" onClick={() => onPickMode('muerte')}>MUERTE SÚBITA</button>
        <button className="btn" onClick={() => onPickMode('var')}>MODO VAR</button>
      </div>
    </div>
  );
}
