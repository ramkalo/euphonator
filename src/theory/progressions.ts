import { HarmonicFunction } from "./functions";

export interface ProgressionPattern {
  id: string;
  /** Sequence of harmonic functions, e.g. ["T","PD","D","T"]. */
  steps: HarmonicFunction[];
  label: string; // "T → PD → D → T"
}

export interface ProgressionCategory {
  id: string;
  name: string;
  blurb: string;
  patterns: ProgressionPattern[];
}

function pat(raw: string): ProgressionPattern {
  const steps = raw.split(/\s*→\s*/).map((s) => s.trim() as HarmonicFunction);
  return { id: steps.join("-"), steps, label: steps.join(" → ") };
}

// The user's raw list, de-duplicated (the one exact repeat, "T → D → PD → T",
// was removed) and grouped into four editable categories.
export const PROGRESSION_CATEGORIES: ProgressionCategory[] = [
  {
    id: "textbook",
    name: "Textbook Cadential",
    blurb: "Forward T → PD → D → T motion. Safe, resolved, classic.",
    patterns: [
      "T → PD → D → T",
      "T → T → PD → D",
      "PD → D → T → T",
      "T → PD → PD → D",
      "T → PD → D → T → T",
      "T → PD → PD → D → T",
      "T → PD → D → T → PD → D",
      "T → T → PD → D → T → T",
      "T → PD → D → T → PD → D → T → T",
    ].map(pat),
  },
  {
    id: "dominant-detour",
    name: "Dominant Detour",
    blurb: "The dominant arrives early, before the pre-dominant. More restless.",
    patterns: [
      "T → D → T → PD",
      "PD → T → D → T",
      "T → PD → T → D",
      "T → D → PD → T",
      "T → D → T → PD → D",
      "T → D → T → PD → T → D",
      "PD → T → D → T → PD → T",
      "T → D → T → PD → T → D → PD → T",
    ].map(pat),
  },
  {
    id: "loops",
    name: "Loops & Vamps",
    blurb: "Short, cyclic, non-resolving — great for grooves and backing loops.",
    patterns: ["PD → D → PD → T", "T → PD → T → PD", "D → T → PD → D"].map(pat),
  },
  {
    id: "winding",
    name: "Extended & Winding",
    blurb: "Longer 5–8 chord journeys that wander before landing.",
    patterns: [
      "PD → T → PD → D → T",
      "T → D → PD → T → PD",
      "PD → T → D → PD → T",
      "T → PD → T → D → PD → T",
      "D → PD → T → D → T → PD",
      "T → PD → T → D → PD → T → D → PD",
    ].map(pat),
  },
];

export const ALL_PATTERNS: ProgressionPattern[] = PROGRESSION_CATEGORIES.flatMap(
  (c) => c.patterns
);

export function categoryById(id: string): ProgressionCategory | undefined {
  return PROGRESSION_CATEGORIES.find((c) => c.id === id);
}
