// src/lib/quotes.ts
export type QuoteAuthor = 'Bruce Lee' | 'Alan Watts';
export type Quote = { text: string; author: QuoteAuthor };

const QUOTES = {
  bruce: [
    { text: 'Be water, my friend.', author: 'Bruce Lee' },
    { text: 'The successful warrior is the average man, with laser-like focus.', author: 'Bruce Lee' },
    { text: 'Absorb what is useful, discard what is not, add what is uniquely your own.', author: 'Bruce Lee' },
    { text: 'Knowing is not enough, we must apply. Willing is not enough, we must do.', author: 'Bruce Lee' },
  ],
  alan: [
    { text: 'Muddy water is best cleared by leaving it alone.', author: 'Alan Watts' },
    { text: 'You are an aperture through which the universe is looking at and exploring itself.', author: 'Alan Watts' },
    { text: 'Stop measuring days by degree of productivity and start experiencing them by degree of presence.', author: 'Alan Watts' },
    { text: 'Trying to define yourself is like trying to bite your own teeth.', author: 'Alan Watts' },
  ],
} as const;

export function pickQuote(pref: 'bruce' | 'alan' | 'both' = 'both'): Quote {
  const pool =
    pref === 'bruce' ? QUOTES.bruce :
    pref === 'alan'  ? QUOTES.alan  :
    [...QUOTES.bruce, ...QUOTES.alan];
  return pool[Math.floor(Math.random() * pool.length)];
}
