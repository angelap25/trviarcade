import React from 'react';

export default function QuestionCard({ currentQ, answered, onAnswer = () => {} }) {
  if (!currentQ) return <div>Cargando pregunta...</div>;
  return (
    <div className="question-card">
      <div className="question-box"><p>{currentQ.q}</p></div>
      <div className="options">
        {currentQ.options.map((opt, i) => (
          <button key={i} className={`option-btn ${answered !== null ? 'disabled' : ''}`} disabled={answered !== null} onClick={() => onAnswer(i)}>{opt}</button>
        ))}
      </div>
    </div>
  );
}
