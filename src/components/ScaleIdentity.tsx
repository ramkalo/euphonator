import {
  identifyHeptatonic,
  identifyPentatonic,
  namedPentatonicName,
} from "../theory/analysis";
import { noteName, PitchClass } from "../theory/notes";

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
    if (named && tonic != null) bits.push(`${noteName(tonic)} ${named}`);
    detail = bits.join(" · ");
  } else if (count === 7) {
    const hits = tonic != null ? identifyHeptatonic(notes, tonic) : [];
    detail = hits.length ? hits.join(" = ") : "not a named heptatonic in the library";
  } else {
    detail = "not a 5- or 7-note scale";
  }

  return (
    <div className="inline-flex items-center gap-2 border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
        {count} note{count === 1 ? "" : "s"}
      </span>
      <span className="h-4 w-px bg-neutral-700" />
      <span className="font-medium text-neutral-200">{detail}</span>
    </div>
  );
}
