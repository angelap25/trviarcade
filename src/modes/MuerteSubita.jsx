import React from 'react';

export default function MuerteSubita({ energy, currentQ, answered, onAnswer }) {
  return (
    <div>
      <div className="energy-wrap">Energía: {energy}</div>
      <div className="question-box"><p>{currentQ?.q}</p></div>
    </div>
  );
}
