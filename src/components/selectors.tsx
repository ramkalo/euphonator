import { Fragment, ReactNode } from "react";
import { mod12, NOTE_NAMES_SHARP, noteName, PitchClass } from "../theory/notes";
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
      title={scale.subfamily}
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
 * Beginner-friendly semitone distance map: the notes in tonic order, the step
 * between each (from the previous note), and each note's distance from the tonic.
 */
export function SemitoneMap({
  notes,
  tonic,
}: {
  notes: PitchClass[];
  tonic: PitchClass | null;
}) {
  if (notes.length === 0 || tonic == null) return null;
  const sorted = [...new Set(notes)].sort((a, b) => a - b);
  const ti = sorted.indexOf(tonic);
  const ordered = ti >= 0 ? [...sorted.slice(ti), ...sorted.slice(0, ti)] : sorted;

  return (
    <div className="flex items-start gap-1 overflow-x-auto pb-1">
      {ordered.map((pc, i) => {
        const next = i + 1 < ordered.length ? ordered[i + 1] : tonic;
        const step = mod12(next - pc) || 12;
        return (
          <Fragment key={pc}>
            <div className="flex shrink-0 flex-col items-center gap-1">
              <span
                className={`grid h-7 w-8 place-items-center text-xs font-bold ${noteFnFill(
                  pc,
                  tonic
                )}`}
              >
                {noteName(pc)}
              </span>
              <span className="font-mono text-[10px] text-neutral-500">{mod12(pc - tonic)}</span>
            </div>
            <div className="flex shrink-0 flex-col items-center pt-1.5">
              <span className="text-[10px] font-semibold text-neutral-300">+{step}</span>
              <span className="mt-1 h-px w-6 bg-neutral-600" />
            </div>
          </Fragment>
        );
      })}
      {/* Octave: back to the tonic 12 semitones up. */}
      <div className="flex shrink-0 flex-col items-center gap-1 opacity-50">
        <span
          className={`grid h-7 w-8 place-items-center text-xs font-bold ${noteFnFill(tonic, tonic)}`}
        >
          {noteName(tonic)}
        </span>
        <span className="font-mono text-[10px] text-neutral-500">12</span>
      </div>
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
  const conventional = HEPTATONIC_SCALES.filter((s) => s.subfamily === "conventional");
  const unconventional = HEPTATONIC_SCALES.filter((s) => s.subfamily === "unconventional");
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
          <PickerRow label="Conventional">
            {conventional.map((s) => (
              <ScaleButton key={s.id} scale={s} value={value} onChange={onChange} />
            ))}
          </PickerRow>
          <PickerRow label="Unconventional">
            {unconventional.map((s) => (
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
