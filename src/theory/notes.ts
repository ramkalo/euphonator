// Pitch is modeled as pitch classes 0-11. Default spelling uses sharps to
// match the "Chord Notes with C as root" column in the source document.

export type PitchClass = number; // 0..11

export const NOTE_NAMES_SHARP = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export const NOTE_NAMES_FLAT = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

export const ALL_PITCH_CLASSES: PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

/** Pitch classes that fall on black keys (accidentals). */
export const BLACK_PCS = new Set<PitchClass>([1, 3, 6, 8, 10]);

// For each black key: the natural a semitone below (whose letter the sharp
// spelling borrows) and the natural a semitone above (whose letter the flat
// spelling borrows).
const BLACK_NEIGHBOURS: Record<number, { lower: PitchClass; upper: PitchClass }> = {
  1: { lower: 0, upper: 2 }, // C# / Db
  3: { lower: 2, upper: 4 }, // D# / Eb
  6: { lower: 5, upper: 7 }, // F# / Gb
  8: { lower: 7, upper: 9 }, // G# / Ab
  10: { lower: 9, upper: 11 }, // A# / Bb
};

/** Wrap any integer into the 0..11 pitch-class range. */
export function mod12(n: number): PitchClass {
  return ((n % 12) + 12) % 12;
}

/** Name a pitch class (sharp spelling). */
export function noteName(pc: PitchClass): string {
  return NOTE_NAMES_SHARP[mod12(pc)];
}

/**
 * Spell a pitch class intelligently given the notes present as context.
 * Naturals keep their letter. A black key prefers the spelling whose letter
 * isn't already taken by a neighbour: if the lower natural is present and the
 * upper isn't, use the flat (upper letter); if the upper is present and the
 * lower isn't, use the sharp (lower letter); otherwise default to the sharp.
 */
export function spellNote(pc: PitchClass, context: Iterable<PitchClass>): string {
  const p = mod12(pc);
  if (!BLACK_PCS.has(p)) return NOTE_NAMES_SHARP[p];
  const { lower, upper } = BLACK_NEIGHBOURS[p];
  const ctx = new Set<PitchClass>();
  for (const c of context) ctx.add(mod12(c));
  const lowerTaken = ctx.has(lower);
  const upperTaken = ctx.has(upper);
  if (lowerTaken && !upperTaken) return NOTE_NAMES_FLAT[p];
  return NOTE_NAMES_SHARP[p];
}

/** Transpose a pitch class by a number of semitones. */
export function transpose(pc: PitchClass, semitones: number): PitchClass {
  return mod12(pc + semitones);
}

/**
 * Convert an interval shape measured "relative to the previous note" (the
 * document's Chord Shape / scale step notation) into pitch classes measured
 * from the root. The leading 0 is optional.
 *
 * e.g. [0,4,3] -> [0,4,7]  (Major triad)
 *      [2,2,1,2,2,2,1] with a leading 0 -> [0,2,4,5,7,9,11] (Major scale, octave dropped)
 */
export function shapeToPitchClasses(shape: number[]): PitchClass[] {
  const out: PitchClass[] = [];
  let running = 0;
  for (const step of shape) {
    running += step;
    out.push(mod12(running));
  }
  // De-duplicate while preserving order (an octave-closing step folds back to 0).
  const seen = new Set<PitchClass>();
  const unique: PitchClass[] = [];
  for (const pc of out) {
    if (!seen.has(pc)) {
      seen.add(pc);
      unique.push(pc);
    }
  }
  return unique;
}

/** Realize a set of from-root pitch classes at a concrete root. */
export function realize(root: PitchClass, fromRoot: PitchClass[]): PitchClass[] {
  return fromRoot.map((pc) => transpose(root, pc));
}

/** True when every pitch class in `subset` is also in `set`. */
export function isSubset(subset: Iterable<PitchClass>, set: Iterable<PitchClass>): boolean {
  const big = new Set(set);
  for (const pc of subset) {
    if (!big.has(pc)) return false;
  }
  return true;
}

/** Intersection of two pitch-class collections, sorted ascending. */
export function intersect(a: Iterable<PitchClass>, b: Iterable<PitchClass>): PitchClass[] {
  const setB = new Set(b);
  const out = new Set<PitchClass>();
  for (const pc of a) if (setB.has(pc)) out.add(pc);
  return [...out].sort((x, y) => x - y);
}

/** Sort a pitch-class list ascending. */
export function sortPcs(pcs: Iterable<PitchClass>): PitchClass[] {
  return [...pcs].sort((a, b) => a - b);
}
