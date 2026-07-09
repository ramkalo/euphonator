import { ChordType } from "./chords";
import { PitchClass, mod12 } from "./notes";
import { Scale } from "./scales";

export type HarmonicFunction = "T" | "PD" | "D";

export const FUNCTION_LABELS: Record<HarmonicFunction, string> = {
  T: "Tonic",
  PD: "Pre-Dominant",
  D: "Dominant",
};

/**
 * Map from a chord root's semitone offset (relative to the scale root) to its
 * harmonic function. Edit this single table to retune the whole app's sense of
 * T / PD / D (it drives both the note colouring and the chord badges).
 *
 * Primary functions only — one note per function:
 *   T  (tonic):        0  (the root, I)
 *   PD (pre-dominant): 5  (the perfect 4th, IV)
 *   D  (dominant):     7  (the perfect 5th, V)
 *   (every other offset is left unassigned / neutral)
 */
export const OFFSET_FUNCTION_MAP: Partial<Record<number, HarmonicFunction>> = {
  0: "T",
  5: "PD",
  7: "D",
};

/** Harmonic function of a chord root, given the scale root. */
export function functionForRoot(
  chordRoot: PitchClass,
  scaleRoot: PitchClass
): HarmonicFunction | null {
  const offset = mod12(chordRoot - scaleRoot);
  return OFFSET_FUNCTION_MAP[offset] ?? null;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export interface RomanLabel {
  /** The roman numeral with case/symbol applied, e.g. "vii°", "IV". */
  numeral: string;
  /** Extra suffix for non-triads (sus / unconventional), e.g. "sus2", "Tan". */
  suffix: string;
}

/**
 * Roman-numeral label for a chord whose root sits at `degreeIndex` (0-based
 * position within the scale's sorted note list).
 */
export function romanLabel(degreeIndex: number, chord: ChordType): RomanLabel {
  const base = ROMAN[degreeIndex] ?? "?";
  switch (chord.quality) {
    case "major":
      return { numeral: base, suffix: "" };
    case "augmented":
      return { numeral: base + "+", suffix: "" };
    case "minor":
      return { numeral: base.toLowerCase(), suffix: "" };
    case "diminished":
      return { numeral: base.toLowerCase() + "°", suffix: "" };
    case "sus":
      return { numeral: base, suffix: chord.abbr.toLowerCase() };
    default:
      return { numeral: base, suffix: chord.abbr };
  }
}

/** Position (0-based) of a pitch class within a scale, or -1 if not a member. */
export function degreeIndexOf(pc: PitchClass, scaleNotesAbsolute: PitchClass[]): number {
  return scaleNotesAbsolute.indexOf(pc);
}

/** Absolute scale notes (pitch classes) for a scale realized at a root. */
export function scaleNotesAt(scale: Scale, root: PitchClass): PitchClass[] {
  return scale.fromRoot.map((pc) => mod12(root + pc));
}
