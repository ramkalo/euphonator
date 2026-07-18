import { Toggle } from "../components/ui";
import { ExtraChordToggles } from "./shared";

const TOGGLES: { key: keyof ExtraChordToggles; label: string }[] = [
  { key: "standard", label: "Standard" },
  { key: "aug", label: "Augmented" },
  { key: "dim", label: "Diminished" },
  { key: "sus", label: "Suspended" },
  { key: "kamala", label: "Kamala" },
  { key: "tanava", label: "Tanava" },
  { key: "panka", label: "Panka" },
  { key: "sankula", label: "Sankula" },
];

/** The shared chord-category toggle bar used by both tools. */
export function ChordToggleBar({
  toggles,
  onChange,
}: {
  toggles: ExtraChordToggles;
  onChange: (t: ExtraChordToggles) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TOGGLES.map(({ key, label }) => (
        <Toggle
          key={key}
          checked={toggles[key]}
          onChange={(v) => onChange({ ...toggles, [key]: v })}
          label={label}
        />
      ))}
    </div>
  );
}
