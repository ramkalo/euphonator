import {
  identifyHeptatonic,
  identifyPentatonic,
  namedPentatonicName,
} from "../theory/analysis";
import { PitchClass, spellNote } from "../theory/notes";

/**
 * Inline status for the note-based selector: names the pentatonic (at 5 notes)
 * or heptatonic (at 7 notes) the current selection forms, if any.
 */
export function ScaleIdentity({
  notes,
  tonic,
}: {
  notes: PitchClass[];
  tonic: PitchClass | null;
}) {
  const count = notes.length;

  let detail: string;
  if (count === 0) {
    detail = "No notes selected";
  } else if (count === 5) {
    const penta = identifyPentatonic(notes);
    const named = tonic != null ? namedPentatonicName(notes, tonic) : null;
    const bits = [`RK #${penta?.index} (${penta?.code})`];
    if (named && tonic != null) bits.push(`${spellNote(tonic, notes)} ${named}`);
    detail = bits.join(" · ");
  } else if (count === 7) {
    const hits = tonic != null ? identifyHeptatonic(notes, tonic) : [];
    detail = hits.length
      ? hits.map((h) => `${spellNote(h.root, notes)} ${h.name}`).join(" = ")
      : "not a named heptatonic in the library";
  } else {
    detail = "not a 5- or 7-note scale";
  }

  return (
    <div className="border border-neutral-800 bg-neutral-900/60 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
        {count} note{count === 1 ? "" : "s"}
      </div>
      <div className="mt-1 text-base font-semibold text-neutral-100">{detail}</div>
    </div>
  );
}
