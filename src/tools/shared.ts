import { KeyHighlight } from "../components/Keyboard";
import { ChordPoolOptions } from "../theory/analysis";
import { PitchClass, spellNote } from "../theory/notes";
import { Scale } from "../theory/scales";
import { scaleNotesAt } from "../theory/functions";

/** Build keyboard highlights for a scale realized at a root. */
export function scaleHighlights(
  scale: Scale,
  root: PitchClass
): Record<number, KeyHighlight> {
  const notes = scaleNotesAt(scale, root);
  const out: Record<number, KeyHighlight> = {};
  for (const pc of notes) out[pc] = { variant: "accent", label: spellNote(pc, notes) };
  out[root] = { variant: "root", label: spellNote(root, notes) };
  return out;
}

export interface ExtraChordToggles {
  standard: boolean;
  aug: boolean;
  dim: boolean;
  sus: boolean;
  kamala: boolean;
  tanava: boolean;
  panka: boolean;
  sankula: boolean;
}

export function togglesToOptions(t: ExtraChordToggles): ChordPoolOptions {
  return {
    standard: t.standard,
    aug: t.aug,
    dim: t.dim,
    sus: t.sus,
    kamala: t.kamala,
    tanava: t.tanava,
    panka: t.panka,
    sankula: t.sankula,
  };
}

export const DEFAULT_TOGGLES: ExtraChordToggles = {
  standard: true,
  aug: true,
  dim: true,
  sus: false,
  kamala: false,
  tanava: false,
  panka: false,
  sankula: false,
};
