import { Fragment, useMemo, useState } from "react";
import { FunctionBadge, RomanBadge } from "../components/badges";
import { ScaleIdentity } from "../components/ScaleIdentity";
import { Column, DataTable } from "../components/Table";
import {
  KeySelector,
  NoteDisplayRow,
  NoteMultiSelector,
  ScalePicker,
  SemitoneMap,
  TonicRow,
  noteFnFill,
} from "../components/selectors";
import { FunctionLegend, Panel, SectionLabel, Segmented, Toggle } from "../components/ui";
import {
  CommonOverlap,
  ResolvedChord,
  chordsInNotes,
  overlapByCommon,
  pivotScales,
} from "../theory/analysis";
import { inversionsFor } from "../theory/chords";
import { scaleNotesAt } from "../theory/functions";
import { noteName, PitchClass } from "../theory/notes";
import { ALL_SCALES, Scale, scaleById } from "../theory/scales";
import { DEFAULT_TOGGLES, togglesToOptions } from "./shared";

type Mode = "notes" | "rootname";

export function ChordsInScaleTool() {
  const [mode, setMode] = useState<Mode>("notes");

  // Note-based selection: the chosen notes, plus a separately-chosen tonic.
  const [selected, setSelected] = useState<PitchClass[]>([0, 2, 4, 5, 7, 9, 11]);
  const [tonicSel, setTonicSel] = useState<PitchClass | null>(0);

  // Root + name selection.
  const [root, setRoot] = useState<PitchClass>(0);
  const [scaleId, setScaleId] = useState("major");

  const [toggles, setToggles] = useState({ ...DEFAULT_TOGGLES });
  const opts = togglesToOptions(toggles);

  // Resolve the active note set + tonic from whichever selector is in use.
  const { notes, tonic } = useMemo(() => {
    if (mode === "notes") {
      const t =
        tonicSel != null && selected.includes(tonicSel)
          ? tonicSel
          : ([...selected].sort((a, b) => a - b)[0] ?? null);
      return { notes: selected, tonic: t };
    }
    const scale = scaleById(scaleId)!;
    return { notes: scaleNotesAt(scale, root), tonic: root as PitchClass };
  }, [mode, selected, tonicSel, scaleId, root]);

  const chords = useMemo(
    () => (tonic == null ? [] : chordsInNotes(notes, tonic, opts)),
    [notes, tonic, toggles]
  );
  const overlaps = useMemo(() => {
    if (notes.length === 0) return [];
    // In root+name mode, drop the exact scale the user picked (but keep other
    // scales with the same notes, e.g. A Natural minor when C Major is chosen).
    const exclude =
      mode === "rootname" ? { excludeScaleId: scaleId, excludeRoot: root } : {};
    return overlapByCommon(notes, tonic ?? notes[0], { minCommon: 5, opts, ...exclude });
  }, [mode, notes, tonic, scaleId, root, toggles]);

  // A scale checked in the overlap table becomes the second source for pivots.
  const [pivotKey, setPivotKey] = useState<string | null>(null);
  const pivotSource = overlaps.find((o) => `${o.scale.id}-${o.root}` === pivotKey);
  const pivots = useMemo(() => {
    if (!pivotSource || tonic == null) return [];
    return pivotScales(notes, tonic, pivotSource.notes, { minCommon: 5, opts });
  }, [notes, tonic, pivotSource, toggles]);

  function toggleNote(pc: PitchClass) {
    const has = selected.includes(pc);
    const next = has ? selected.filter((n) => n !== pc) : [...selected, pc];
    setSelected(next);
    if (!has && tonicSel == null) setTonicSel(pc);
    else if (has && tonicSel === pc) {
      setTonicSel([...next].sort((a, b) => a - b)[0] ?? null);
    }
  }

  function resetNotes(pcs: PitchClass[], newTonic: PitchClass | null) {
    setSelected(pcs);
    setTonicSel(newTonic);
  }

  return (
    <div className="space-y-4">
      <Panel className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented<Mode>
            options={[
              { value: "notes", label: "Build" },
              { value: "rootname", label: "Select" },
            ]}
            value={mode}
            onChange={setMode}
          />
          {mode === "notes" && <ScaleIdentity notes={notes} tonic={tonic} />}
        </div>

        {mode === "notes" ? (
          <div className="mt-4 space-y-3">
            <div>
              <SectionLabel>Select Notes</SectionLabel>
              <NoteMultiSelector selected={selected} tonic={tonic} onToggle={toggleNote} />
              <SemitoneMap notes={selected} />
            </div>
            <div>
              <SectionLabel>Select Tonic</SectionLabel>
              <TonicRow notes={selected} tonic={tonic} onPick={setTonicSel} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => resetNotes([], null)}
                className="bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-700"
              >
                Clear
              </button>
              <button
                onClick={() => resetNotes([0, 2, 4, 5, 7, 9, 11], 0)}
                className="bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-700"
              >
                Reset to C Major
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <SectionLabel>Root</SectionLabel>
              <KeySelector value={root} onChange={setRoot} />
            </div>
            <div>
              <SectionLabel>Scale</SectionLabel>
              <ScalePicker value={scaleId} onChange={(s) => setScaleId(s.id)} />
            </div>
            <div className="lg:col-span-2">
              <SectionLabel>Notes</SectionLabel>
              <NoteDisplayRow notes={notes} tonic={tonic} />
            </div>
          </div>
        )}

        <FunctionLegend className="mt-4 border-t border-neutral-800 pt-4" />
      </Panel>

      <Panel className="p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <SectionLabel>Chords in Scale</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <Toggle
              checked={toggles.aug}
              onChange={(v) => setToggles({ ...toggles, aug: v })}
              label="Augmented"
            />
            <Toggle
              checked={toggles.dim}
              onChange={(v) => setToggles({ ...toggles, dim: v })}
              label="Diminished"
            />
            <Toggle
              checked={toggles.sus}
              onChange={(v) => setToggles({ ...toggles, sus: v })}
              label="Suspended"
            />
            <Toggle
              checked={toggles.unconventional}
              onChange={(v) => setToggles({ ...toggles, unconventional: v })}
              label="Unconventional"
            />
          </div>
        </div>
        <ChordTable chords={chords} />
      </Panel>

      <Panel className="p-4">
        <SectionLabel>Overlapping Scales Table</SectionLabel>
        <p className="mb-3 mt-1 text-xs text-neutral-400">
            Scales that share notes with your selected scale.
          </p>
        <div className="mt-3">
          <OverlapAccordion
            overlaps={overlaps}
            tonic={tonic ?? 0}
            emptyText="Select at least 5 notes to find overlapping scales."
            selectable
            selectedKey={pivotKey}
            onSelect={(o) => {
              const key = `${o.scale.id}-${o.root}`;
              setPivotKey((prev) => (prev === key ? null : key));
            }}
          />
        </div>
      </Panel>

      <Panel className="p-4">
        <SectionLabel>Pivot Scales Table</SectionLabel>
          <p className="mb-3 mt-1 text-xs text-neutral-400">
            Scales that share notes with your selected scale and the scale you checked from the overlapping scale table.
          </p>
        <div className="mt-3">
          <OverlapAccordion
            overlaps={pivots}
            tonic={tonic ?? 0}
            emptyText="Check a scale in the overlapping table above to find pivot scales."
          />
        </div>
      </Panel>
    </div>
  );
}

function ChordTable({ chords }: { chords: ResolvedChord[] }) {
  const columns: Column<ResolvedChord>[] = [
    {
      key: "full",
      header: "Full name",
      className: "font-semibold text-neutral-100",
      render: (c) => `${noteName(c.root)} ${c.chord.name}`,
    },
    {
      key: "chord",
      header: "Chord",
      className: "font-semibold text-neutral-100",
      render: (c) => c.name,
    },
    {
      key: "shape",
      header: "Shape",
      className: "font-mono text-neutral-300",
      render: (c) => c.chord.shape.join(" "),
    },
    {
      key: "notes",
      header: "Notes",
      className: "font-mono text-neutral-300",
      render: (c) => c.notes.map(noteName).join(" "),
    },
    {
      key: "inv",
      header: "Inversions",
      className: "text-neutral-400",
      render: (c) => {
        const inv = inversionsFor(c.chord.abbr);
        return inv.length ? inv.map((i) => i.abbr).join(", ") : "—";
      },
    },
    {
      key: "func",
      header: "Function",
      render: (c) => (
        <span className="inline-flex items-center gap-2">
          <RomanBadge roman={c.roman} />
          <FunctionBadge func={c.func} size="sm" />
        </span>
      ),
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={chords}
      rowKey={(c) => c.id}
      empty="No chords fit the current selection."
    />
  );
}

// --- Overlapping-scales accordion ----------------------------------------

type OverlapCategoryId = "common" | "less-common" | "pentatonic";

interface OverlapFamily {
  key: string;
  label: string;
  scale: Scale;
  maxShared: number;
  rows: CommonOverlap[];
}
interface OverlapCategory {
  id: OverlapCategoryId;
  name: string;
  count: number;
  families: OverlapFamily[];
}

function categoryOf(scale: Scale): OverlapCategoryId {
  if (scale.family === "pentatonic") return "pentatonic";
  return scale.subfamily === "less-common" ? "less-common" : "common";
}

// Fixed family order = the catalog definition order, so both tables agree.
const SCALE_ORDER = new Map(ALL_SCALES.map((s, i) => [s.id, i]));

/** Group overlap rows by scale family, under Common / Less Common / Pentatonic. */
function groupOverlaps(overlaps: CommonOverlap[]): OverlapCategory[] {
  const fams = new Map<string, OverlapFamily>();
  for (const o of overlaps) {
    // Heptatonic scales get one family per scale type; every pentatonic match
    // collapses into a single "Pentatonic" family that lists the scales directly.
    const isPenta = o.scale.family === "pentatonic";
    const key = isPenta ? "pentatonic" : o.scale.id;
    let fam = fams.get(key);
    if (!fam) {
      fam = {
        key,
        label: isPenta ? "Pentatonic" : o.scale.name,
        scale: o.scale,
        maxShared: 0,
        rows: [],
      };
      fams.set(key, fam);
    }
    fam.rows.push(o);
    fam.maxShared = Math.max(fam.maxShared, o.common.length);
  }
  // Rows inside a family sort by shared-note count — except pentatonics, which
  // sort by the number of shared chords (most first).
  for (const fam of fams.values()) {
    if (fam.key === "pentatonic") {
      fam.rows.sort(
        (a, b) =>
          b.sharedChords.length - a.sharedChords.length ||
          b.common.length - a.common.length ||
          a.name.localeCompare(b.name)
      );
    } else {
      fam.rows.sort(
        (a, b) => b.common.length - a.common.length || a.name.localeCompare(b.name)
      );
    }
  }

  const meta: { id: OverlapCategoryId; name: string }[] = [
    { id: "common", name: "Common" },
    { id: "less-common", name: "Less Common" },
    { id: "pentatonic", name: "Pentatonic" },
  ];
  return meta
    .map(({ id, name }) => {
      const families = [...fams.values()].filter((f) => categoryOf(f.scale) === id);
      families.sort(
        (a, b) =>
          (SCALE_ORDER.get(a.scale.id) ?? Number.MAX_SAFE_INTEGER) -
          (SCALE_ORDER.get(b.scale.id) ?? Number.MAX_SAFE_INTEGER)
      );
      const count = families.reduce((s, f) => s + f.rows.length, 0);
      return { id, name, count, families };
    })
    .filter((c) => c.families.length > 0);
}

function Caret({ open }: { open: boolean }) {
  return (
    <span
      className={`inline-block h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-neutral-400 transition-transform ${
        open ? "rotate-90" : ""
      }`}
    />
  );
}

const OVERLAP_COLS = 4;
const OVERLAP_HEADERS = [
  "Scale Name",
  "Relative Semitones",
  "Shared Notes",
  "Shared Chords",
];

/**
 * Scale notes as little squares. Shared notes use the same function colour coding
 * as the main scale picker (relative to `tonic`); non-shared notes stay dim.
 */
function NoteSquares({
  notes,
  shared,
  tonic,
}: {
  notes: PitchClass[];
  shared: PitchClass[];
  tonic: PitchClass;
}) {
  const sharedSet = new Set(shared);
  return (
    <div className="flex w-max gap-0.5">
      {notes.map((pc) => (
        <span
          key={pc}
          className={`grid h-6 w-7 shrink-0 place-items-center text-[10px] font-bold ${
            sharedSet.has(pc) ? noteFnFill(pc, tonic) : "bg-neutral-800 text-neutral-500"
          }`}
        >
          {noteName(pc)}
        </span>
      ))}
    </div>
  );
}

/**
 * All chords in the scale as little boxes. Shared chords (all notes within the
 * shared set) are colour-coded by root function vs `tonic`; the rest are greyed.
 */
function ChordChips({
  chords,
  common,
  tonic,
}: {
  chords: ResolvedChord[];
  common: PitchClass[];
  tonic: PitchClass;
}) {
  if (chords.length === 0) return <span className="text-neutral-500">—</span>;
  const commonSet = new Set(common);
  return (
    <div className="flex flex-wrap gap-1">
      {chords.map((c) => {
        const shared = c.notes.every((n) => commonSet.has(n));
        return (
          <span
            key={c.id}
            className={`px-1.5 py-0.5 text-[11px] font-semibold ${
              shared ? noteFnFill(c.root, tonic) : "bg-neutral-800/60 text-neutral-500"
            }`}
          >
            {c.name}
          </span>
        );
      })}
    </div>
  );
}

function overlapKey(o: CommonOverlap): string {
  return `${o.scale.id}-${o.root}`;
}

function OverlapAccordion({
  overlaps,
  tonic,
  emptyText,
  selectable = false,
  selectedKey = null,
  onSelect,
}: {
  overlaps: CommonOverlap[];
  tonic: PitchClass;
  emptyText: string;
  selectable?: boolean;
  selectedKey?: string | null;
  onSelect?: (o: CommonOverlap) => void;
}) {
  // Families flattened in category order (common -> less-common -> pentatonic).
  const families = useMemo(
    () => groupOverlaps(overlaps).flatMap((c) => c.families),
    [overlaps]
  );
  const [openFams, setOpenFams] = useState<Set<string>>(new Set());

  if (overlaps.length === 0) {
    return <div className="px-1 py-6 text-sm text-neutral-500">{emptyText}</div>;
  }

  const headers = selectable ? ["", ...OVERLAP_HEADERS] : OVERLAP_HEADERS;
  const cols = OVERLAP_COLS + (selectable ? 1 : 0);

  const toggleFam = (key: string) =>
    setOpenFams((s) => {
      const next = new Set(s);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <div className="overflow-x-auto border border-neutral-800">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-neutral-900">
          <tr className="text-left">
            {headers.map((h, i) => (
              <th
                key={h || `col-${i}`}
                className="whitespace-nowrap border-b border-neutral-700 px-10 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {families.map((fam) => {
            const famOpen = openFams.has(fam.key);
            return (
              <Fragment key={fam.key}>
                <tr className="bg-neutral-900/40">
                  <td colSpan={cols} className="border-b border-neutral-800/70 px-10 py-1.5">
                    <button
                      onClick={() => toggleFam(fam.key)}
                      className="flex w-full items-center gap-2 text-left text-sm font-semibold text-neutral-100"
                    >
                      <Caret open={famOpen} />
                      {fam.label}
                      <span className="text-xs font-normal text-neutral-500">
                        {fam.rows.length} scale{fam.rows.length === 1 ? "" : "s"} · up to{" "}
                        {fam.maxShared} shared notes
                      </span>
                    </button>
                  </td>
                </tr>

                {famOpen &&
                  fam.rows.map((o) => {
                    const key = overlapKey(o);
                    return (
                      <tr
                        key={key}
                        className={`border-b border-neutral-800/70 hover:bg-neutral-800/40 ${
                          selectable && selectedKey === key ? "bg-ocean-500/10" : ""
                        }`}
                      >
                        {selectable && (
                          <td className="px-10 py-1.5 align-top">
                            <input
                              type="checkbox"
                              checked={selectedKey === key}
                              onChange={() => onSelect?.(o)}
                              className="h-4 w-4 accent-ocean-500"
                              aria-label={`Use ${o.name} as pivot source`}
                            />
                          </td>
                        )}
                        <td className="px-10 py-1.5 pl-7 align-top font-semibold text-neutral-100">
                          {o.name}
                        </td>
                        <td className="px-10 py-1.5 align-top font-mono text-neutral-300">
                          {o.code}
                        </td>
                        <td className="px-10 py-1.5 align-top">
                          <NoteSquares notes={o.notes} shared={o.common} tonic={tonic} />
                        </td>
                        <td className="w-full px-10 py-1.5 align-top">
                          <ChordChips chords={o.scaleChords} common={o.common} tonic={tonic} />
                        </td>
                      </tr>
                    );
                  })}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
