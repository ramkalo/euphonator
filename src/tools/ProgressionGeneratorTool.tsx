import { useState } from "react";
import { Keyboard } from "../components/Keyboard";
import { KeySelector, ScalePicker } from "../components/selectors";
import { FunctionBadge, RomanBadge } from "../components/badges";
import { FUNCTION_STYLE, NoteChip, Panel, SectionLabel, Segmented, Toggle } from "../components/ui";
import {
  ProgressionSlot,
  ResolvedChord,
  candidatesForFunction,
  generateProgression,
} from "../theory/analysis";
import { noteName, PitchClass } from "../theory/notes";
import { scaleById } from "../theory/scales";
import {
  PROGRESSION_CATEGORIES,
  ProgressionPattern,
  categoryById,
} from "../theory/progressions";
import { DEFAULT_TOGGLES, scaleHighlights, togglesToOptions } from "./shared";

export function ProgressionGeneratorTool() {
  const [root, setRoot] = useState<PitchClass>(0);
  const [scaleId, setScaleId] = useState("major");
  const [categoryId, setCategoryId] = useState(PROGRESSION_CATEGORIES[0].id);
  const [patternId, setPatternId] = useState<string>("random");
  const [toggles, setToggles] = useState({ ...DEFAULT_TOGGLES });

  const [slots, setSlots] = useState<ProgressionSlot[] | null>(null);
  const [pool, setPool] = useState<ResolvedChord[]>([]);
  const [swapIndex, setSwapIndex] = useState<number | null>(null);

  const scale = scaleById(scaleId)!;
  const category = categoryById(categoryId)!;

  function pickPattern(): ProgressionPattern {
    if (patternId === "random") {
      return category.patterns[Math.floor(Math.random() * category.patterns.length)];
    }
    return category.patterns.find((p) => p.id === patternId) ?? category.patterns[0];
  }

  function generate() {
    const pattern = pickPattern();
    const result = generateProgression(scale, root, pattern.steps, togglesToOptions(toggles));
    setPool(result.pool);
    setSlots(result.slots);
    setSwapIndex(null);
  }

  function rerollSlot(i: number) {
    if (!slots) return;
    const candidates = candidatesForFunction(pool, slots[i].func);
    if (!candidates.length) return;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    const next = [...slots];
    next[i] = { ...next[i], chord: pick };
    setSlots(next);
  }

  function setSlotChord(i: number, chord: ResolvedChord) {
    if (!slots) return;
    const next = [...slots];
    next[i] = { ...next[i], chord };
    setSlots(next);
    setSwapIndex(null);
  }

  return (
    <div className="space-y-4">
      <Panel className="p-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <SectionLabel>Root</SectionLabel>
            <KeySelector value={root} onChange={setRoot} />
          </div>
          <div>
            <SectionLabel>Scale</SectionLabel>
            <ScalePicker value={scaleId} onChange={(s) => setScaleId(s.id)} />
          </div>
        </div>
        <div className="mt-4">
          <Keyboard highlights={scaleHighlights(scale, root)} height={120} />
        </div>
      </Panel>

      <Panel className="p-4">
        <SectionLabel>Progression style</SectionLabel>
        <Segmented
          options={PROGRESSION_CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
          value={categoryId}
          onChange={(id) => {
            setCategoryId(id);
            setPatternId("random");
          }}
        />
        <p className="mt-2 text-xs text-neutral-400">{category.blurb}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => setPatternId("random")}
            className={` px-3 py-1.5 text-xs font-semibold transition ${
              patternId === "random"
                ? "bg-ocean-500 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            Random in category
          </button>
          {category.patterns.map((p) => (
            <button
              key={p.id}
              onClick={() => setPatternId(p.id)}
              className={` px-3 py-1.5 text-xs font-medium transition ${
                patternId === p.id
                  ? "bg-ocean-500 text-white"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              {p.label}{" "}
              <span className="opacity-60">({p.steps.length})</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Toggle checked={toggles.aug} onChange={(v) => setToggles({ ...toggles, aug: v })} label="Augmented" />
            <Toggle checked={toggles.dim} onChange={(v) => setToggles({ ...toggles, dim: v })} label="Diminished" />
            <Toggle checked={toggles.sus} onChange={(v) => setToggles({ ...toggles, sus: v })} label="Suspended" />
            <Toggle
              checked={toggles.unconventional}
              onChange={(v) => setToggles({ ...toggles, unconventional: v })}
              label="Unconventional"
            />
          </div>
          <button
            onClick={generate}
            className="bg-coral-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-coral-400"
          >
            Generate progression
          </button>
        </div>
      </Panel>

      {slots && (
        <Panel className="p-4">
          <SectionLabel>Your progression — tap a chord to swap or reroll it</SectionLabel>
          <div className="flex flex-wrap items-stretch gap-2">
            {slots.map((slot, i) => (
              <div key={i} className="flex items-center gap-2">
                <SlotCard
                  slot={slot}
                  active={swapIndex === i}
                  onClick={() => setSwapIndex(swapIndex === i ? null : i)}
                />
                {i < slots.length - 1 && <span className="text-neutral-600">→</span>}
              </div>
            ))}
          </div>

          {swapIndex !== null && slots[swapIndex] && (
            <SwapPanel
              slot={slots[swapIndex]}
              candidates={candidatesForFunction(pool, slots[swapIndex].func)}
              onPick={(c) => setSlotChord(swapIndex, c)}
              onReroll={() => rerollSlot(swapIndex)}
            />
          )}
        </Panel>
      )}
    </div>
  );
}

function SlotCard({
  slot,
  active,
  onClick,
}: {
  slot: ProgressionSlot;
  active: boolean;
  onClick: () => void;
}) {
  const s = FUNCTION_STYLE[slot.func];
  return (
    <button
      onClick={onClick}
      className={`min-w-[112px]  border bg-neutral-900/70 p-3 text-left transition ${
        active ? "border-neutral-300 ring-2 ring-neutral-400/40" : "border-neutral-800 hover:border-neutral-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold ${s.text}`}>{slot.func}</span>
        {slot.chord && <RomanBadge roman={slot.chord.roman} />}
      </div>
      <div className="mt-1 text-sm font-bold text-neutral-100">
        {slot.chord ? slot.chord.name : "—"}
      </div>
      <div className="mt-1 flex flex-wrap gap-0.5">
        {slot.chord?.notes.map((pc, i) => (
          <NoteChip key={i} name={noteName(pc)} size="sm" />
        ))}
      </div>
    </button>
  );
}

function SwapPanel({
  slot,
  candidates,
  onPick,
  onReroll,
}: {
  slot: ProgressionSlot;
  candidates: ResolvedChord[];
  onPick: (c: ResolvedChord) => void;
  onReroll: () => void;
}) {
  return (
    <div className="mt-4  border border-neutral-800 bg-neutral-950/60 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs text-neutral-400">
        <FunctionBadge func={slot.func} size="sm" />
        <span>
          {candidates.length} option{candidates.length === 1 ? "" : "s"} for this slot
        </span>
        <button
          onClick={onReroll}
          className="ml-auto  bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-neutral-200 hover:bg-neutral-700"
        >
          Reroll
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {candidates.map((c) => (
          <button
            key={c.id}
            onClick={() => onPick(c)}
            className={` px-2.5 py-1.5 text-xs font-semibold transition ${
              slot.chord?.id === c.id
                ? "bg-ocean-500 text-white"
                : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
            }`}
            title={c.chord.name}
          >
            <span className="mr-1 opacity-70">
              {c.roman.numeral}
              {c.roman.suffix}
            </span>
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
