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

export const ALL_PITCH_CLASSES: PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

/** Wrap any integer into the 0..11 pitch-class range. */
export function mod12(n: number): PitchClass {
  return ((n % 12) + 12) % 12;
}

/** Name a pitch class (sharp spelling). */
export function noteName(pc: PitchClass): string {
  return NOTE_NAMES_SHARP[mod12(pc)];
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
