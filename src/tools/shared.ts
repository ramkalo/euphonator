import { KeyHighlight } from "../components/Keyboard";
import { ChordPoolOptions } from "../theory/analysis";
import { PitchClass } from "../theory/notes";
import { Scale } from "../theory/scales";
import { scaleNotesAt } from "../theory/functions";

/** Build keyboard highlights for a scale realized at a root. */
export function scaleHighlights(
  scale: Scale,
  root: PitchClass
): Record<number, KeyHighlight> {
  const notes = scaleNotesAt(scale, root);
  const out: Record<number, KeyHighlight> = {};
  for (const pc of notes) out[pc] = { variant: "accent" };
  out[root] = { variant: "root" };
  return out;
}

export interface ExtraChordToggles {
  aug: boolean;
  dim: boolean;
  sus: boolean;
  unconventional: boolean;
}

export function togglesToOptions(t: ExtraChordToggles): ChordPoolOptions {
  return { aug: t.aug, dim: t.dim, sus: t.sus, unconventional: t.unconventional };
}

export const DEFAULT_TOGGLES: ExtraChordToggles = {
  aug: true,
  dim: true,
  sus: false,
  unconventional: false,
};
