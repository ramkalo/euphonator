import { useMemo, useState } from "react";
import { scaleIdForNotes } from "../theory/analysis";
import { scaleNotesAt } from "../theory/functions";
import { PitchClass } from "../theory/notes";
import { scaleById } from "../theory/scales";

export type ScaleMode = "notes" | "rootname";

/**
 * The scale selection shared between Scale Explorer and the Progression
 * Generator. Scale Explorer renders the builder UI that drives this state; the
 * Progression Generator reads the resolved `notes` + `tonic` from it.
 *
 * The selection is dual-mode: in "notes" mode the note set (`selected`) is free
 * and may not correspond to any catalog scale; in "rootname" mode it is a named
 * scale shape (`scaleId`) rooted at `tonic`. `notes` is the resolved set either
 * way.
 */
export interface ScaleSelection {
  mode: ScaleMode;
  tonic: PitchClass;
  selected: PitchClass[];
  scaleId: string;
  notes: PitchClass[];
  setTonic: (next: PitchClass) => void;
  toggleNote: (pc: PitchClass) => void;
  changeMode: (next: ScaleMode) => void;
  resetNotes: (pcs: PitchClass[], newTonic: PitchClass) => void;
  setScaleId: (id: string) => void;
}

export function useScaleSelection(): ScaleSelection {
  const [mode, setMode] = useState<ScaleMode>("notes");

  // Shared tonic/root, used by both modes. Notes-mode selection always includes it.
  const [tonic, setTonicState] = useState<PitchClass>(0);
  const [selected, setSelected] = useState<PitchClass[]>([0, 2, 4, 5, 7, 9, 11]);

  // By-name selection: the scale shape only (its root comes from `tonic`).
  const [scaleId, setScaleId] = useState("major");

  // Resolve the active note set from whichever selector is in use.
  const notes = useMemo(() => {
    if (mode === "notes") return selected;
    return scaleNotesAt(scaleById(scaleId)!, tonic);
  }, [mode, selected, scaleId, tonic]);

  // Keep the two modes in sync when switching, using the mode being left as the
  // source of truth. Notes mode gets populated with the named scale's notes;
  // By-name mode reflects the built notes when they form a catalog scale.
  function changeMode(next: ScaleMode) {
    if (next === mode) return;
    if (next === "notes") {
      setSelected(scaleNotesAt(scaleById(scaleId)!, tonic));
    } else {
      const id = scaleIdForNotes(selected, tonic);
      if (id) setScaleId(id);
    }
    setMode(next);
  }

  // Changing the tonic: if it isn't already one of the selected notes, the old
  // tonic drops out of the selection and the new one takes its place. Otherwise
  // the note set is unchanged and only the colouring shifts.
  function setTonic(next: PitchClass) {
    if (mode === "notes" && !selected.includes(next)) {
      setSelected([...selected.filter((n) => n !== tonic), next]);
    }
    setTonicState(next);
  }

  // The tonic is mandatory, so it can't be toggled off from the note grid.
  function toggleNote(pc: PitchClass) {
    if (pc === tonic) return;
    setSelected(
      selected.includes(pc) ? selected.filter((n) => n !== pc) : [...selected, pc]
    );
  }

  function resetNotes(pcs: PitchClass[], newTonic: PitchClass) {
    setSelected(pcs);
    setTonicState(newTonic);
  }

  return {
    mode,
    tonic,
    selected,
    scaleId,
    notes,
    setTonic,
    toggleNote,
    changeMode,
    resetNotes,
    setScaleId,
  };
}
