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