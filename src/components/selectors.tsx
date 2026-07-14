import { ReactNode } from "react";
import { NOTE_NAMES_SHARP, noteName, PitchClass } from "../theory/notes";
import { functionForRoot } from "../theory/functions";
import {
  NAMED_PENTATONICS,
  PENTATONIC_SCALES,
  Scale,
  HEPTATONIC_SCALES,
  scaleById,
} from "../theory/scales";
import { Segmented } from "./ui";

/**
 * Fill classes for a note coloured by its harmonic function relative to the
 * tonic: tonic = coral (T), pre-dominant = kelp green, dominant = reef green,
 * everything else = ocean blue. Keeps the selectors coordinated with the badges.
 */
export function noteFnFill(pc: PitchClass, tonic: PitchClass | null): string {
  if (tonic != null && pc === tonic) return "bg-coral-500 text-white";
  const f = tonic != null ? functionForRoot(pc, tonic) : null;
  if (f === "PD") return "bg-kelp-500 text-white";
  if (f === "D") return "bg-reef-500 text-white";
  return "bg-ocean-500 text-white";
}

export function KeySelector({
  value,
  onChange,
}: {
  value: PitchClass;
  onChange: (pc: PitchClass) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {NOTE_NAMES_SHARP.map((name, pc) => {
        const black = name.includes("#");
        const active = value === pc;
        return (
          <button
            key={pc}
            onClick={() => onChange(pc)}
            className={`h-9 w-10  text-sm font-bold transition ${
              active
                ? "bg-coral-500 text-white shadow-lg"
                : black
                  ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  : "bg-neutral-700/60 text-neutral-100 hover:bg-neutral-600"
            }`}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Multi-select note grid (same square styling as KeySelector). Selected notes
 * are coloured by their harmonic function relative to the tonic.
 */
export function NoteMultiSelector({
  selected,
  tonic,
  onToggle,
}: {
  selected: PitchClass[];
  tonic: PitchClass | null;
  onToggle: (pc: PitchClass) => void;
}) {
  const sel = new Set(selected);
  return (
    <div className="flex flex-wrap gap-1">
      {NOTE_NAMES_SHARP.map((name, pc) => {
        const black = name.includes("#");
        const isSel = sel.has(pc);
        return (
          <button
            key={pc}
            onClick={() => onToggle(pc)}
            className={`h-9 w-10 text-sm font-bold transition ${
              isSel
                ? noteFnFill(pc, tonic)
                : black
                  ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  : "bg-neutral-700/60 text-neutral-100 hover:bg-neutral-600"
            }`}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Tonic picker: shows only the currently-selected notes as smaller squares
 * (80% of NoteMultiSelector) and lets the user mark one as the tonic.
 */
export function TonicRow({
  notes,
  tonic,
  onPick,
}: {
  notes: PitchClass[];
  tonic: PitchClass | null;
  onPick: (pc: PitchClass) => void;
}) {
  if (notes.length === 0) {
    return <div className="text-xs text-neutral-500">Select notes above to choose a tonic.</div>;
  }
  const sorted = [...notes].sort((a, b) => a - b);
  return (
    <div className="flex flex-wrap gap-1">
      {sorted.map((pc) => (
        <button
          key={pc}
          onClick={() => onPick(pc)}
          className={`h-[1.8rem] w-[2rem] text-xs font-bold transition hover:brightness-110 ${noteFnFill(
            pc,
            tonic
          )}`}
        >
          {noteName(pc)}
        </button>
      ))}
    </div>
  );
}

function ScaleButton({
  scale,
  value,
  onChange,
}: {
  scale: Scale;
  value: string;
  onChange: (scale: Scale) => void;
}) {
  return (
    <button
      onClick={() => onChange(scale)}
      className={`px-3 py-1.5 text-sm font-medium transition ${
        value === scale.id
          ? "bg-ocean-500 text-white shadow"
          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
      }`}
      title={
        scale.subfamily === "common"
          ? "Common"
          : scale.subfamily === "less-common"
          ? "Less Common"
          : scale.subfamily
      }
    >
      {scale.name}
    </button>
  );
}

function PickerRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

/**
 * Read-only display of a scale's notes (ordered from the tonic). Tonic shows in
 * the deeper amber; the rest in the lighter amber.
 */
export function NoteDisplayRow({
  notes,
  tonic,
}: {
  notes: PitchClass[];
  tonic: PitchClass | null;
}) {
  const sorted = [...notes].sort((a, b) => a - b);
  const ti = tonic != null ? sorted.indexOf(tonic) : -1;
  const ordered = ti >= 0 ? [...sorted.slice(ti), ...sorted.slice(0, ti)] : sorted;
  return (
    <div className="flex flex-wrap gap-1">
      {ordered.map((pc) => (
        <div
          key={pc}
          className={`grid h-9 w-10 place-items-center text-sm font-bold ${noteFnFill(
            pc,
            tonic
          )}`}
        >
          {noteName(pc)}
        </div>
      ))}
    </div>
  );
}

/**
 * Subtle semitone-step reminder aligned to the 12-note selector above. Each `+N`
 * is centred between the two selected notes it spans — e.g. C + D put "+2" under
 * the C# square. Uses the selector's geometry (w-10 squares = 2.5rem, gap-1 =
 * 0.25rem, so 2.75rem per square step; a square centre is +1.25rem into itself).
 */
export function SemitoneMap({ notes }: { notes: PitchClass[] }) {
  const sorted = [...new Set(notes)].sort((a, b) => a - b);
  if (sorted.length < 2) return null;

  const gaps = sorted
    .slice(0, -1)
    .map((a, i) => ({ a, b: sorted[i + 1], step: sorted[i + 1] - a }));

  return (
    <div className="relative mt-1">
      {/* Invisible spacer matching the 12 note squares so widths line up. */}
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-4 w-10" />
        ))}
      </div>
      {gaps.map((g, i) => (
        <span
          key={i}
          className="absolute top-0 -translate-x-1/2 font-mono text-xs text-neutral-500"
          style={{ left: `calc(${(g.a + g.b) / 2} * 2.75rem + 1.25rem)` }}
        >
          +{g.step}
        </span>
      ))}
    </div>
  );
}

export function ScalePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (scale: Scale) => void;
}) {
  const current = scaleById(value);
  const family: "heptatonic" | "pentatonic" = current?.family ?? "heptatonic";
  const common = HEPTATONIC_SCALES.filter((s) => s.subfamily === "common");
  const lessCommon = HEPTATONIC_SCALES.filter((s) => s.subfamily === "less-common");
  // The RK-index select only reflects a value when a raw RK shape is chosen.
  const rkValue = current && current.index != null && !current.named ? value : "";

  return (
    <div className="space-y-3">
      <Segmented<"heptatonic" | "pentatonic">
        options={[
          { value: "heptatonic", label: "Heptatonic (7)" },
          { value: "pentatonic", label: "Pentatonic (5)" },
        ]}
        value={family}
        onChange={(fam) => {
          if (fam === "heptatonic") onChange(HEPTATONIC_SCALES[0]);
          else onChange(NAMED_PENTATONICS[0]);
        }}
      />

      {family === "heptatonic" ? (
        <div className="space-y-2">
          <PickerRow label="Common">
            {common.map((s) => (
              <ScaleButton key={s.id} scale={s} value={value} onChange={onChange} />
            ))}
          </PickerRow>
          <PickerRow label="Less Common">
            {lessCommon.map((s) => (
              <ScaleButton key={s.id} scale={s} value={value} onChange={onChange} />
            ))}
          </PickerRow>
        </div>
      ) : (
        <div className="space-y-2">
          <PickerRow label="Named">
            {NAMED_PENTATONICS.map((s) => (
              <ScaleButton key={s.id} scale={s} value={value} onChange={onChange} />
            ))}
          </PickerRow>
          <PickerRow label="RK Index">
            <select
              value={rkValue}
              onChange={(e) => e.target.value && onChange(scaleById(e.target.value)!)}
              className="border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-100"
            >
              <option value="">Choose a shape…</option>
              {PENTATONIC_SCALES.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.index} · {s.code}
                </option>
              ))}
            </select>
          </PickerRow>
        </div>
      )}
    </div>
  );
}
