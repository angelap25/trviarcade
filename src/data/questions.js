export const YEARS = [
  1986,
  1990,
  1994,
  1998,
  2002,
  2006,
  2010,
  2014,
  2018,
  2022
];

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Preguntas de ejemplo (puedes ampliarlas fácilmente)
export const QUESTIONS_GENERAL = [
  { q: '¿Qué país ganó el Mundial 2018?', options: ['Brasil', 'Francia', 'Alemania', 'Argentina'], correct: 1 },
  { q: '¿En qué año fue México 86?', options: ['1984', '1986', '1988', '1990'], correct: 1 },
  { q: '¿Quién ganó la Copa Mundial de 2014?', options: ['Argentina', 'Alemania', 'Brasil', 'España'], correct: 1 },
  { q: '¿Cuántos jugadores hay en cancha por equipo?', options: ['9', '10', '11', '12'], correct: 2 },
  { q: '¿Cuál es el máximo goleador histórico de la selección argentina (hasta 2022)?', options: ['Maradona', 'Messi', 'Batistuta', 'Agüero'], correct: 1 },
  { q: '¿Qué país organizó el Mundial 2002 junto a Japón?', options: ['Corea del Sur', 'Francia', 'Italia', 'Inglaterra'], correct: 0 },
  { q: '¿Cuál es la duración oficial de un partido de fútbol?', options: ['60 minutos', '80 minutos', '90 minutos', '120 minutos'], correct: 2 },
  { q: '¿Qué futbolista ganó el Balón de Oro en 2019?', options: ['Ronaldo', 'Messi', 'Modrić', 'Van Dijk'], correct: 1 },
  { q: '¿Cuándo se introdujo el VAR en los Mundiales por primera vez?', options: ['2014', '2018', '2006', '2022'], correct: 1 },
  { q: '¿Qué selección tiene más títulos mundiales?', options: ['Brasil', 'Alemania', 'Italia', 'Argentina'], correct: 0 }
];

// Preguntas por año (ejemplo reducido por cada mundial)
export const QUESTIONS_BY_YEAR = {
  1986: [
    { q: '¿Quién fue la figura del Mundial 1986?', options: ['Maradona', 'Kempes', 'Ramos', 'Zico'], correct: 0 }
  ],
  1990: [
    { q: '¿Dónde se jugó el Mundial 1990?', options: ['Italia', 'Alemania', 'Estados Unidos', 'Francia'], correct: 0 }
  ],
  1994: [
    { q: '¿Quién ganó 1994?', options: ['Brasil', 'Italia', 'Alemania', 'Argentina'], correct: 0 }
  ],
  1998: [
    { q: '¿Quién fue campeón en 1998?', options: ['Francia', 'Brasil', 'Francia', 'Croacia'], correct: 0 }
  ],
  2002: [
    { q: '¿Qué país ganó en 2002?', options: ['Brasil', 'Alemania', 'Italia', 'Inglaterra'], correct: 0 }
  ],
  2006: [
    { q: '¿Dónde fue el Mundial 2006?', options: ['Alemania', 'Sudáfrica', 'Brasil', 'Corea'], correct: 0 }
  ],
  2010: [
    { q: '¿Qué país ganó en 2010?', options: ['España', 'Holanda', 'Italia', 'Alemania'], correct: 0 }
  ],
  2014: [
    { q: '¿Quién ganó en 2014?', options: ['Alemania', 'Argentina', 'Brasil', 'España'], correct: 0 }
  ],
  2018: [
    { q: '¿Quién ganó en 2018?', options: ['Francia', 'Croacia', 'Bélgica', 'Inglaterra'], correct: 0 }
  ],
  2022: [
    { q: '¿Quién ganó en 2022?', options: ['Argentina', 'Francia', 'Brasil', 'Croacia'], correct: 0 }
  ]
};

export default {
  YEARS,
  shuffle,
  QUESTIONS_GENERAL,
  QUESTIONS_BY_YEAR
};
