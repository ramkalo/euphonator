import {
  ALL_CHORD_TYPES,
  ChordType,
} from "./chords";
import {
  HarmonicFunction,
  RomanLabel,
  functionForRoot,
  romanLabel,
  scaleNotesAt,
} from "./functions";
import {
  PitchClass,
  intersect,
  isSubset,
  mod12,
  noteName,
  realize,
  sortPcs,
} from "./notes";
import {
  ALL_SCALES,
  HEPTATONIC_SCALES,
  NAMED_PENTATONICS,
  NECKLACE_TO_PENTATONIC,
  Scale,
  canonicalNecklace,
  intervalCode,
} from "./scales";

// --- Chord pool selection ------------------------------------------------

export interface ChordPoolOptions {
  /** Major & minor triads are always included. */
  aug?: boolean;
  dim?: boolean;
  sus?: boolean;
  unconventional?: boolean;
}

export function chordPool(opts: ChordPoolOptions = {}): ChordType[] {
  return ALL_CHORD_TYPES.filter((c) => {
    if (c.quality === "major" || c.quality === "minor") return true;
    if (c.quality === "augmented") return !!opts.aug;
    if (c.quality === "diminished") return !!opts.dim;
    if (c.quality === "sus") return !!opts.sus;
    if (c.category === "unconventional") return !!opts.unconventional;
    return false;
  });
}

export const FULL_POOL: ChordPoolOptions = {
  aug: true,
  dim: true,
  sus: true,
  unconventional: true,
};

// --- Resolved chord (a chord placed at a concrete root in a scale) -------

export interface ResolvedChord {
  id: string;
  chord: ChordType;
  root: PitchClass;
  /** "C Maj" style name. */
  name: string;
  notes: PitchClass[];
  degreeIndex: number;
  roman: RomanLabel;
  func: HarmonicFunction | null;
}

export function chordDisplayName(root: PitchClass, chord: ChordType): string {
  return `${noteName(root)} ${chord.abbr}`;
}

// --- Tool 1: Chords in a scale -------------------------------------------

/**
 * Chords whose notes fit entirely within an arbitrary set of notes. Degree
 * index / Roman numerals / functions are computed relative to `tonic` (notes
 * are ordered ascending starting from the tonic). Works for both the root+name
 * selector (tonic = scale root) and the free note selector (tonic = first note).
 */
export function chordsInNotes(
  notes: PitchClass[],
  tonic: PitchClass,
  opts: ChordPoolOptions = FULL_POOL
): ResolvedChord[] {
  const set = new Set(notes);
  const pool = chordPool(opts);

  // Order notes ascending, rotated so the tonic is degree 0.
  const sorted = [...set].sort((a, b) => a - b);
  const tonicIdx = sorted.indexOf(tonic);
  const ordered =
    tonicIdx >= 0 ? [...sorted.slice(tonicIdx), ...sorted.slice(0, tonicIdx)] : sorted;

  const out: ResolvedChord[] = [];
  ordered.forEach((root, degreeIndex) => {
    for (const chord of pool) {
      const cnotes = realize(root, chord.fromRoot);
      if (isSubset(cnotes, set)) {
        out.push({
          id: `${root}-${chord.abbr}`,
          chord,
          root,
          name: chordDisplayName(root, chord),
          notes: cnotes,
          degreeIndex,
          roman: romanLabel(degreeIndex, chord),
          func: functionForRoot(root, tonic),
        });
      }
    }
  });
  return out;
}

export function chordsInScale(
  scale: Scale,
  scaleRoot: PitchClass,
  opts: ChordPoolOptions = FULL_POOL
): ResolvedChord[] {
  return chordsInNotes(scaleNotesAt(scale, scaleRoot), scaleRoot, opts);
}

// --- Tool 2: Scale overlap -----------------------------------------------

export interface ScaleAlias {
  scale: Scale;
  root: PitchClass;
  rootName: string;
  /** "C Major", "A Natural minor", "G Pentatonic #31". */
  name: string;
}

export interface OverlapMatch {
  /** Canonical sorted pitch classes of this exact note collection. */
  notes: PitchClass[];
  /** Notes in the collection that are NOT in the kept set. */
  extraNotes: PitchClass[];
  /** All scale/root names that produce this exact note collection. */
  aliases: ScaleAlias[];
}

export interface OverlapFilters {
  pentatonic: boolean;
  heptatonic: boolean;
}

/**
 * Every scale (across all 12 roots) whose note set contains all `keptNotes`.
 * Results that share the exact same note collection are merged into one match
 * with multiple aliases (e.g. C Major and A Natural minor).
 */
export function scaleOverlap(
  keptNotes: PitchClass[],
  filters: OverlapFilters,
  { excludeScaleId, excludeRoot }: { excludeScaleId?: string; excludeRoot?: PitchClass } = {}
): OverlapMatch[] {
  const kept = new Set(keptNotes);
  const bySignature = new Map<string, OverlapMatch>();

  for (const scale of ALL_SCALES) {
    if (scale.family === "pentatonic" && !filters.pentatonic) continue;
    if (scale.family === "heptatonic" && !filters.heptatonic) continue;

    for (let root = 0; root < 12; root++) {
      if (scale.id === excludeScaleId && root === excludeRoot) continue;
      const notes = scaleNotesAt(scale, root);
      if (!isSubset(kept, notes)) continue;

      const sorted = sortPcs(notes);
      const sig = sorted.join(",");
      const alias: ScaleAlias = {
        scale,
        root,
        rootName: noteName(root),
        name: `${noteName(root)} ${scale.name}`,
      };
      const existing = bySignature.get(sig);
      if (existing) {
        existing.aliases.push(alias);
      } else {
        bySignature.set(sig, {
          notes: sorted,
          extraNotes: sorted.filter((pc) => !kept.has(pc)),
          aliases: [alias],
        });
      }
    }
  }

  // Fewest extra notes first (closest relatives), then by size.
  return [...bySignature.values()].sort(
    (a, b) => a.extraNotes.length - b.extraNotes.length || a.notes.length - b.notes.length
  );
}

// --- Tool 3: Transition (pivot) chords -----------------------------------

export interface TransitionChord {
  id: string;
  chord: ChordType;
  root: PitchClass;
  name: string;
  notes: PitchClass[];
  funcA: HarmonicFunction | null;
  funcB: HarmonicFunction | null;
}

/**
 * Chords whose notes lie entirely within the intersection of two scales — they
 * belong to both keys and so can pivot between them.
 */
export function transitionChords(
  scaleA: Scale,
  rootA: PitchClass,
  scaleB: Scale,
  rootB: PitchClass,
  opts: ChordPoolOptions = FULL_POOL
): { common: PitchClass[]; chords: TransitionChord[] } {
  const notesA = scaleNotesAt(scaleA, rootA);
  const notesB = scaleNotesAt(scaleB, rootB);
  const common = intersect(notesA, notesB);
  const commonSet = new Set(common);
  const pool = chordPool(opts);
  const chords: TransitionChord[] = [];

  for (const root of common) {
    for (const chord of pool) {
      const notes = realize(root, chord.fromRoot);
      if (isSubset(notes, commonSet)) {
        chords.push({
          id: `${root}-${chord.abbr}`,
          chord,
          root,
          name: chordDisplayName(root, chord),
          notes,
          funcA: functionForRoot(root, rootA),
          funcB: functionForRoot(root, rootB),
        });
      }
    }
  }
  return { common, chords };
}

// --- Tool 4: Progression generation --------------------------------------

export type Rng = () => number;

export function candidatesForFunction(
  pool: ResolvedChord[],
  func: HarmonicFunction
): ResolvedChord[] {
  return pool.filter((c) => c.func === func);
}

export interface ProgressionSlot {
  func: HarmonicFunction;
  chord: ResolvedChord | null;
}

/**
 * Generate a progression: for each function slot in the pattern, pick a random
 * in-scale chord whose function matches. Chord vocabulary is controlled by
 * `opts` (the tool's toggles).
 */
export function generateProgression(
  scale: Scale,
  scaleRoot: PitchClass,
  steps: HarmonicFunction[],
  opts: ChordPoolOptions,
  rng: Rng = Math.random
): { pool: ResolvedChord[]; slots: ProgressionSlot[] } {
  const pool = chordsInScale(scale, scaleRoot, opts);
  const slots = steps.map((func) => {
    const candidates = candidatesForFunction(pool, func);
    const chord = candidates.length
      ? candidates[Math.floor(rng() * candidates.length)]
      : null;
    return { func, chord };
  });
  return { pool, slots };
}

// --- Scale identification (note-based selector) --------------------------

/** Which RK pentatonic entry a 5-note set is (always matches; index is complete). */
export function identifyPentatonic(
  pcs: PitchClass[]
): { index: number; code: string } | null {
  if (new Set(pcs).size !== 5) return null;
  const s = NECKLACE_TO_PENTATONIC.get(canonicalNecklace(pcs));
  return s ? { index: s.index!, code: s.code! } : null;
}

/** Named pentatonic (Major/Minor) for a 5-note set rooted at `tonic`, if any. */
export function namedPentatonicName(pcs: PitchClass[], tonic: PitchClass): string | null {
  if (new Set(pcs).size !== 5) return null;
  const rel = sortPcs(pcs.map((pc) => mod12(pc - tonic)));
  const relKey = rel.join(",");
  const match = NAMED_PENTATONICS.find((np) => sortPcs(np.fromRoot).join(",") === relKey);
  return match ? match.name : null;
}

/** Heptatonic scale names for a 7-note set (tonic-rooted reading listed first). */
export function identifyHeptatonic(pcs: PitchClass[], tonic: PitchClass): string[] {
  if (new Set(pcs).size !== 7) return [];
  const target = new Set(pcs);
  const hits: { name: string; isTonic: boolean }[] = [];
  for (const scale of HEPTATONIC_SCALES) {
    for (let root = 0; root < 12; root++) {
      const notes = scaleNotesAt(scale, root);
      if (notes.length === target.size && notes.every((n) => target.has(n))) {
        hits.push({ name: `${noteName(root)} ${scale.name}`, isTonic: root === tonic });
      }
    }
  }
  hits.sort((a, b) => Number(b.isTonic) - Number(a.isTonic));
  return hits.map((h) => h.name);
}

// --- Overlap by shared-note count (dense table on the Chords page) -------

export interface CommonOverlap {
  scale: Scale;
  root: PitchClass;
  name: string;
  /** Interval code, e.g. "2232" (pentatonic RK) or "2212221" (heptatonic). */
  code: string;
  notes: PitchClass[];
  common: PitchClass[];
  /** Chords that fit within the shared notes. */
  sharedChords: ResolvedChord[];
  /** Every chord in the full scale (superset of sharedChords). */
  scaleChords: ResolvedChord[];
}

/**
 * Every catalog scale (all 12 roots) sharing at least `minCommon` notes with the
 * selection, sorted by shared-note count (most first). Only the exact scale the
 * user picked (excludeScaleId + excludeRoot) is dropped — other scales with the
 * same note set (e.g. A Natural minor for C Major) are kept and rank at the top.
 * Shared chords are the chords that fit within the shared (intersection) notes.
 */
export function overlapByCommon(
  notes: PitchClass[],
  tonic: PitchClass,
  {
    minCommon = 5,
    opts = FULL_POOL,
    excludeScaleId,
    excludeRoot,
  }: {
    minCommon?: number;
    opts?: ChordPoolOptions;
    excludeScaleId?: string;
    excludeRoot?: PitchClass;
  } = {}
): CommonOverlap[] {
  const selSet = new Set(notes);
  const out: CommonOverlap[] = [];

  for (const scale of ALL_SCALES) {
    for (let root = 0; root < 12; root++) {
      if (scale.id === excludeScaleId && root === excludeRoot) continue;

      // scaleNotesAt keeps the scale in tonic order (root first, then up).
      const scaleNotes = scaleNotesAt(scale, root);
      const common = scaleNotes.filter((n) => selSet.has(n));
      if (common.length < minCommon) continue;

      const sharedTonic = common.includes(tonic) ? tonic : common[0];
      out.push({
        scale,
        root,
        name: `${noteName(root)} ${scale.name}`,
        code: scale.code ?? intervalCode(scaleNotes),
        notes: scaleNotes,
        common,
        sharedChords: chordsInNotes(common, sharedTonic, opts),
        scaleChords: chordsInNotes(scaleNotes, root, opts),
      });
    }
  }

  // Most shared notes first; then smaller scales, then name for stability.
  out.sort(
    (a, b) =>
      b.common.length - a.common.length ||
      a.notes.length - b.notes.length ||
      a.name.localeCompare(b.name)
  );
  return out;
}

function sameNoteSet(set: Set<PitchClass>, notes: PitchClass[]): boolean {
  return notes.length === set.size && notes.every((n) => set.has(n));
}

/**
 * Pivot scales: catalog scales (all 12 roots) sharing at least `minCommon` notes
 * with BOTH the main selection and a second (chosen) scale — scales you can move
 * through to bridge the two. The two source scales (and their note-set twins) are
 * excluded. To read/sort consistently with the overlap table, `common` (the
 * highlighted notes) is the pivot's overlap with the MAIN scale; the second scale
 * only acts as a filter.
 */
export function pivotScales(
  mainNotes: PitchClass[],
  mainTonic: PitchClass,
  otherNotes: PitchClass[],
  { minCommon = 5, opts = FULL_POOL }: { minCommon?: number; opts?: ChordPoolOptions } = {}
): CommonOverlap[] {
  const mainSet = new Set(mainNotes);
  const otherSet = new Set(otherNotes);
  const out: CommonOverlap[] = [];

  for (const scale of ALL_SCALES) {
    for (let root = 0; root < 12; root++) {
      const scaleNotes = scaleNotesAt(scale, root);
      if (sameNoteSet(mainSet, scaleNotes) || sameNoteSet(otherSet, scaleNotes)) continue;

      let sharedMain = 0;
      let sharedOther = 0;
      for (const n of scaleNotes) {
        if (mainSet.has(n)) sharedMain++;
        if (otherSet.has(n)) sharedOther++;
      }
      if (sharedMain < minCommon || sharedOther < minCommon) continue;

      const common = scaleNotes.filter((n) => mainSet.has(n));
      const sharedTonic = common.includes(mainTonic) ? mainTonic : common[0] ?? scaleNotes[0];
      out.push({
        scale,
        root,
        name: `${noteName(root)} ${scale.name}`,
        code: scale.code ?? intervalCode(scaleNotes),
        notes: scaleNotes,
        common,
        sharedChords: chordsInNotes(common, sharedTonic, opts),
        scaleChords: chordsInNotes(scaleNotes, root, opts),
      });
    }
  }

  out.sort(
    (a, b) =>
      b.common.length - a.common.length ||
      a.notes.length - b.notes.length ||
      a.name.localeCompare(b.name)
  );
  return out;
}
