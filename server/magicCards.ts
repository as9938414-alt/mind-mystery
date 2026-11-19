/**
 * Magic Cards engine — the classic binary "mind reading cards" principle.
 *
 * Every value in the range is written in binary. Card k shows every value whose
 * k-th bit is 1. The spectator only says "yes, it's on this card" or "no", and
 * the sum of the bit values of the "yes" cards is exactly their number.
 *
 * It is 100% deterministic: with honest answers it can never miss, needs no AI
 * call, and works offline. Card order is shuffled per session so the binary
 * pattern is not obvious to the audience.
 */

export type MagicCardKind = 'number' | 'alphabet';

export interface MagicCardDeck {
  kind: MagicCardKind;
  min: number;
  max: number;
  /** Bit indexes in the (shuffled) order the cards will be shown. */
  bitOrder: number[];
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createDeck(kind: MagicCardKind, range?: { min: number; max: number }): MagicCardDeck {
  const min = kind === 'alphabet' ? 1 : Math.max(1, Math.floor(range?.min ?? 1));
  const max = kind === 'alphabet' ? 26 : Math.max(min + 1, Math.floor(range?.max ?? 100));
  const bits: number[] = [];
  for (let b = 0; 1 << b <= max; b++) {
    // Skip a card that would have no values on it (can only happen with min > 1).
    if (cardValues(min, max, b).length > 0) bits.push(b);
  }
  return { kind, min, max, bitOrder: shuffle(bits) };
}

function cardValues(min: number, max: number, bit: number): number[] {
  const out: number[] = [];
  for (let v = min; v <= max; v++) if (v & (1 << bit)) out.push(v);
  return out;
}

export function cardItems(deck: MagicCardDeck, cardIndex: number): string[] {
  const bit = deck.bitOrder[cardIndex];
  const values = cardValues(deck.min, deck.max, bit);
  return deck.kind === 'alphabet' ? values.map((v) => LETTERS[v - 1]) : values.map(String);
}

export function isYesAnswer(answer: string): boolean {
  const a = answer.trim().toLowerCase();
  return a.startsWith('yes') || a === 'y' || a.includes("it's here") || a.includes('it is here');
}

/** Returns the decoded value, or null when the answers contradict each other. */
export function decodeDeck(deck: MagicCardDeck, yesBits: number[]): { value: number; display: string } | null {
  const value = yesBits.reduce((sum, b) => sum + (1 << b), 0);
  if (value < deck.min || value > deck.max) return null;
  const display = deck.kind === 'alphabet' ? LETTERS[value - 1] : String(value);
  return { value, display };
}

export function cardColumns(deck: MagicCardDeck, itemCount: number): number {
  if (deck.kind === 'alphabet') return Math.min(7, itemCount);
  if (itemCount <= 16) return 4;
  if (itemCount <= 36) return 6;
  if (itemCount <= 64) return 8;
  return 10;
}
