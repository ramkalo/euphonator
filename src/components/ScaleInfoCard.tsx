import { ScaleIdentity } from "./ScaleIdentity";
import { InfoButton } from "./InfoButton";
import { NoteDisplayRow } from "./selectors";
import { FunctionLegend, Panel, SectionLabel } from "./ui";
import { PitchClass } from "../theory/notes";

/**
 * Read-only summary of the active scale: its notes, the scale it identifies as,
 * and the T/PD/D function legend. Shared by Scale Explorer (as its info card)
 * and the Progression Generator (reflecting the selection made in Scale Explorer).
 */
export function ScaleInfoCard({
  notes,
  tonic,
}: {
  notes: PitchClass[];
  tonic: PitchClass;
}) {
  return (
    <Panel className="p-4">
      <div className="space-y-4">
        <div>
          <SectionLabel>Notes</SectionLabel>
          <NoteDisplayRow notes={notes} tonic={tonic} />
        </div>

        <ScaleIdentity notes={notes} tonic={tonic} />

        <div className="border-t border-neutral-800 pt-4">
          <div className="mb-2 flex items-center gap-2">
            <SectionLabel>Legend</SectionLabel>
            <InfoButton label="What do Tonic, Pre-Dominant and Dominant mean?">
              <span className="mb-2 block">
                These colors show the "pull" of each note or chord, like a short
                trip away from home and back.
              </span>
              <span className="block">
                Tonic (T) is home: calm and settled. Pre-Dominant (PD) steps away
                from home and starts to build tension. Dominant (D) is the peak of
                that tension and pulls strongly back to home. Music feels
                satisfying when it moves home, away, tension, then home again.
              </span>
            </InfoButton>
          </div>
          <FunctionLegend />
        </div>
      </div>
    </Panel>
  );
}
