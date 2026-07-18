import { PitchClass, shapeToPitchClasses } from "./notes";

export type ScaleFamily = "heptatonic" | "pentatonic";

export interface Scale {
  id: string;
  name: string;
  family: ScaleFamily;
  /** "common" | "less-common" for heptatonic; undefined for pentatonic. */
  subfamily?: string;
  /** Pentatonic index number (Ram Kalo Pentatonic Index). */
  index?: number;
  /** Original digit string for pentatonic entries, e.g. "1214". */
  code?: string;
  /** RK Pentatonic Index number a named pentatonic maps to (e.g. Major Pentatonic -> 66). */
  rkIndex?: number;
  /** True for friendly named pentatonics (Major/Minor) that are specific modes of an RK entry. */
  named?: boolean;
  /** Pitch classes measured from the scale root. */
  fromRoot: PitchClass[];
  size: number;
}

function heptatonic(
  id: string,
  name: string,
  subfamily: "common" | "less-common",
  steps: number[]
): Scale {
  const fromRoot = shapeToPitchClasses(steps);
  return { id, name, family: "heptatonic", subfamily, fromRoot, size: fromRoot.length };
}

// --- Heptatonic scales (source doc) ---
export const HEPTATONIC_SCALES: Scale[] = [
  heptatonic("major", "Major", "common", [0, 2, 2, 1, 2, 2, 2, 1]),
  heptatonic("natural-minor", "Natural minor", "common", [0, 2, 1, 2, 2, 1, 2, 2]),
  heptatonic("melodic-minor", "Melodic minor", "less-common", [0, 2, 1, 2, 2, 2, 2, 1]),
  heptatonic("neapolitan-major", "Neapolitan Major", "less-common", [0, 1, 2, 2, 2, 2, 2, 1]),
  heptatonic("harmonic-minor", "Harmonic minor", "less-common", [0, 2, 1, 2, 2, 1, 3, 1]),
  heptatonic("harmonic-major", "Harmonic Major", "less-common", [0, 1, 2, 1, 3, 1, 2, 2]),
  heptatonic("hungarian-major", "Hungarian Major", "less-common", [0, 2, 1, 2, 3, 1, 2, 1]),
  heptatonic("super-locrian", "Super Locrian", "less-common", [0, 2, 1, 3, 2, 1, 2, 1]),
  heptatonic("neapolitan-minor", "Neapolitan minor", "less-common", [0, 1, 2, 2, 2, 1, 3, 1]),
  heptatonic("enigmatic", "Enigmatic", "less-common", [0, 1, 3, 2, 2, 2, 1, 1]),
];

// --- Ram Kalo Pentatonic Index (source doc, complete: 66 = (1/12)·C(12,5)) ---
// Each entry is a 4-digit interval string; the 5th (octave-closing) interval is
// implied as 12 - sum(digits). Modal/inversion-agnostic — one representative per
// pentatonic set-class.
const PENTATONIC_CODES: string[] = [
  "1111", "1112", "1113", "1114", "1115", "1116", "1117", "1121", "1122", "1123",
  "1124", "1125", "1126", "1131", "1132", "1133", "1134", "1135", "1141", "1142",
  "1143", "1144", "1151", "1152", "1153", "1161", "1162", "1171", "1212", "1213",
  "1214", "1215", "1216", "1221", "1222", "1223", "1224", "1225", "1231", "1232",
  "1233", "1234", "1241", "1242", "1243", "1251", "1252", "1313", "1314", "1315",
  "1321", "1322", "1323", "1324", "1331", "1332", "1333", "1342", "1414", "1422",
  "1423", "1432", "1522", "2222", "2223", "2232",
];

export function pentatonicFromCode(code: string): PitchClass[] {
  const digits = code.split("").map(Number);
  // Build a from-root step shape starting at 0; the octave-closing 5th step is
  // implied and simply omitted (it wraps back to the root).
  return shapeToPitchClasses([0, ...digits]);
}

export const PENTATONIC_SCALES: Scale[] = PENTATONIC_CODES.map((code, i) => {
  const fromRoot = pentatonicFromCode(code);
  return {
    id: `penta-${i + 1}`,
    name: `Pentatonic #${i + 1}`,
    family: "pentatonic" as const,
    index: i + 1,
    code,
    fromRoot,
    size: fromRoot.length,
  };
});

// Complete necklace coverage — used for overlap enumeration. Named pentatonics
// are NOT included here (they are specific modes of an existing RK entry and
// would double-count necklace #66).
export const ALL_SCALES: Scale[] = [...HEPTATONIC_SCALES, ...PENTATONIC_SCALES];

// --- Named pentatonics (friendly modes of RK entries, for the root+name picker) ---
function namedPentatonic(id: string, name: string, steps: number[], rkIndex: number): Scale {
  const fromRoot = shapeToPitchClasses([0, ...steps]);
  return { id, name, family: "pentatonic", rkIndex, named: true, fromRoot, size: fromRoot.length };
}

export const NAMED_PENTATONICS: Scale[] = [
  namedPentatonic("major-pentatonic", "Major Pentatonic", [2, 2, 3, 2], 66),
  namedPentatonic("minor-pentatonic", "Minor Pentatonic", [3, 2, 2, 3], 66),
];

/** Everything resolvable by id: catalog + named pentatonics. */
export const REGISTRY: Scale[] = [...ALL_SCALES, ...NAMED_PENTATONICS];

/** Scales offered as a "root scale" the user builds a key from (heptatonic first). */
export const SELECTABLE_SCALES: Scale[] = ALL_SCALES;

export function scaleById(id: string): Scale | undefined {
  return REGISTRY.find((s) => s.id === id);
}

/**
 * Previous-note interval steps for a from-root pitch-class set, joined as a
 * string. Includes the octave-closing step so the digits sum to 12.
 * e.g. Major {0,2,4,5,7,9,11} -> "2212221".
 */
export function intervalCode(fromRoot: PitchClass[]): string {
  const sorted = [...fromRoot].sort((a, b) => a - b);
  return sorted
    .map((pc, i) => {
      const next = sorted[(i + 1) % sorted.length];
      return ((next - pc + 12) % 12) || 12;
    })
    .join("");
}

/** Canonical necklace -> the RK pentatonic entry that owns it. */
export const NECKLACE_TO_PENTATONIC: Map<string, Scale> = new Map(
  PENTATONIC_SCALES.map((s) => [canonicalNecklace(s.fromRoot), s])
);

/**
 * Canonical interval necklace (lexicographically smallest rotation) for a
 * from-root pitch-class set. Two scales share a canonical necklace iff they are
 * modal/transpositional rotations of each other. Used to prove the pentatonic
 * index has no modal synonyms.
 */
export function canonicalNecklace(fromRoot: PitchClass[]): string {
  const sorted = [...fromRoot].sort((a, b) => a - b);
  const intervals = sorted.map((pc, i) => {
    const next = sorted[(i + 1) % sorted.length];
    return ((next - pc + 12) % 12) || 12;
  });
  let best: string | null = null;
  for (let r = 0; r < intervals.length; r++) {
    const rotated = [...intervals.slice(r), ...intervals.slice(0, r)];
    const key = rotated.join(",");
    if (best === null || key < best) best = key;
  }
  return best!;
}
