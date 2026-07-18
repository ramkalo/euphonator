import { PitchClass, shapeToPitchClasses } from "./notes";

export type ChordCategory = "triad" | "unconventional";
export type ChordQuality =
  | "major"
  | "minor"
  | "augmented"
  | "diminished"
  | "sus"
  | "other";
/** Family grouping for unconventional chords (undefined for triads). */
export type ChordFamily = "kamala" | "tanava" | "panka" | "sankula";

export interface ChordType {
  name: string;
  abbr: string;
  /** Interval shape "relative to the previous note" (document's Chord Shape). */
  shape: number[];
  /** Pitch classes measured from the chord root. */
  fromRoot: PitchClass[];
  category: ChordCategory;
  quality: ChordQuality;
  family?: ChordFamily;
}

function chord(
  name: string,
  abbr: string,
  shape: number[],
  category: ChordCategory,
  quality: ChordQuality,
  family?: ChordFamily
): ChordType {
  return {
    name,
    abbr,
    shape,
    fromRoot: shapeToPitchClasses(shape),
    category,
    quality,
    family,
  };
}

// --- Conventional triads (source doc, "Conventional Chords") ---
export const TRIADS: ChordType[] = [
  chord("Major", "Maj", [0, 4, 3], "triad", "major"),
  chord("minor", "min", [0, 3, 4], "triad", "minor"),
  chord("Augmented", "Aug", [0, 4, 4], "triad", "augmented"),
  chord("diminished", "dim", [0, 3, 3], "triad", "diminished"),
  chord("Suspended Second", "Sus2", [0, 2, 5], "triad", "sus"),
  chord("Suspended Fourth", "Sus4", [0, 5, 2], "triad", "sus"),
];

// --- Unconventional chords (source doc, "Unconventional Chords") ---
// Verified against the "ex. Chord Notes" column with C as root.
export const UNCONVENTIONAL_CHORDS: ChordType[] = [
  chord("Chromatic Cluster", "ChrClst", [0, 1, 1], "unconventional", "other", "tanava"),
  chord("Forte32", "F32", [0, 1, 2], "unconventional", "other", "tanava"),
  chord("Tanavaka", "kTan", [0, 1, 3], "unconventional", "other", "tanava"),
  chord("Tanava", "Tan", [0, 1, 4], "unconventional", "other", "tanava"),
  chord("Tanavatara", "rTan", [0, 1, 5], "unconventional", "other", "tanava"),
  chord("Tanavatama", "mTan", [0, 1, 6], "unconventional", "other", "tanava"),
  chord("Sukamala", "sKama", [0, 1, 7], "unconventional", "other", "kamala"),
  chord("Sankula", "San", [0, 1, 8], "unconventional", "other", "sankula"),
  chord("Sankulatara", "rSan", [0, 1, 9], "unconventional", "other", "sankula"),
  chord("Sankulatama", "mSan", [0, 2, 2], "unconventional", "other", "sankula"),
  chord("Suvṛddhakamala", "svKama", [0, 2, 3], "unconventional", "other", "kamala"),
  chord("Panka", "Pan", [0, 2, 4], "unconventional", "other", "panka"),
  chord("Pankatara", "rPan", [0, 2, 6], "unconventional", "other", "panka"),
  chord("Pankatama", "mPan", [0, 2, 7], "unconventional", "other", "panka"),
];

export const ALL_CHORD_TYPES: ChordType[] = [...TRIADS, ...UNCONVENTIONAL_CHORDS];

// --- Inversions (source doc, "Inversions") ---
// A voicing of a parent triad: same pitch classes, different bass. Stored for
// display (how to finger the inversion), keyed by the parent chord's abbr.
export interface Inversion {
  parentAbbr: string;
  abbr: string;
  /** Shape relative to the bass note (previous-note notation). */
  shape: number[];
  /** Optional synonym note from the doc. */
  synonym?: string;
}

export const INVERSIONS: Inversion[] = [
  { parentAbbr: "Maj", abbr: "Maj⁶", shape: [0, 3, 5] },
  { parentAbbr: "Maj", abbr: "Maj⁶⁴", shape: [0, 5, 4] },
  { parentAbbr: "min", abbr: "min⁶", shape: [0, 4, 5] },
  { parentAbbr: "min", abbr: "min⁶⁴", shape: [0, 5, 3] },
  { parentAbbr: "Aug", abbr: "Aug⁶", shape: [0, 4, 4], synonym: "Aug" },
  { parentAbbr: "Aug", abbr: "Aug⁶⁴", shape: [0, 4, 4], synonym: "Aug" },
  { parentAbbr: "dim", abbr: "dim⁶", shape: [0, 3, 6] },
  { parentAbbr: "dim", abbr: "dim⁶⁴", shape: [0, 6, 3] },
  { parentAbbr: "Sus2", abbr: "Sus2⁶", shape: [0, 5, 5] },
  { parentAbbr: "Sus2", abbr: "Sus2⁶⁴", shape: [0, 5, 2], synonym: "Sus4" },
  { parentAbbr: "Sus4", abbr: "Sus4⁶", shape: [0, 2, 5], synonym: "Sus2" },
  { parentAbbr: "Sus4", abbr: "Sus4⁶⁴", shape: [0, 5, 5], synonym: "Sus2⁶" },
];

export function inversionsFor(abbr: string): Inversion[] {
  return INVERSIONS.filter((inv) => inv.parentAbbr === abbr);
}

export function chordByAbbr(abbr: string): ChordType | undefined {
  return ALL_CHORD_TYPES.find((c) => c.abbr === abbr);
}
