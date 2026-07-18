import { describe, expect, it } from "vitest";
import { shapeToPitchClasses, realize, noteName, spellNote } from "../notes";
import { UNCONVENTIONAL_CHORDS, chordByAbbr } from "../chords";
import {
  PENTATONIC_SCALES,
  HEPTATONIC_SCALES,
  canonicalNecklace,
  intervalCode,
  pentatonicFromCode,
  scaleById,
} from "../scales";
import {
  chordPool,
  chordsInNotes,
  chordsInScale,
  generateProgressionFromNotes,
  identifyHeptatonic,
  identifyPentatonic,
  namedPentatonicName,
  scaleIdForNotes,
  overlapByCommon,
  pivotScales,
  scaleOverlap,
  transitionChords,
} from "../analysis";
import { functionForRoot, scaleNotesAt } from "../functions";

const C = 0;
const A = 9;
const B = 11;

function names(pcs: number[]): string[] {
  return pcs.map(noteName);
}

describe("chord math (doc worked examples)", () => {
  it("A Major -> A C# E", () => {
    const maj = chordByAbbr("Maj")!;
    expect(names(realize(A, maj.fromRoot))).toEqual(["A", "C#", "E"]);
  });

  it("minor shape 0 3 4 on B -> B D F#", () => {
    // The doc computes B minor as B +3 -> D, D +4 -> F#.
    expect(names(shapeToPitchClasses([0, 3, 4]).map((pc) => (pc + B) % 12))).toEqual([
      "B",
      "D",
      "F#",
    ]);
  });

  it("C major triad -> C E G", () => {
    const maj = chordByAbbr("Maj")!;
    expect(names(realize(C, maj.fromRoot))).toEqual(["C", "E", "G"]);
  });

  it("unconventional chords match the doc's example notes (C root)", () => {
    const expected: Record<string, string[]> = {
      ChrClst: ["C", "C#", "D"],
      F32: ["C", "C#", "D#"],
      kTan: ["C", "C#", "E"],
      Tan: ["C", "C#", "F"],
      rTan: ["C", "C#", "F#"],
      mTan: ["C", "C#", "G"],
      sKama: ["C", "C#", "G#"],
      San: ["C", "C#", "A"],
      rSan: ["C", "C#", "A#"],
      mSan: ["C", "D", "E"],
      svKama: ["C", "D", "F"],
      Pan: ["C", "D", "F#"],
      rPan: ["C", "D", "G#"],
      mPan: ["C", "D", "A"],
    };
    for (const chord of UNCONVENTIONAL_CHORDS) {
      expect(names(realize(C, chord.fromRoot))).toEqual(expected[chord.abbr]);
    }
  });

  it("every unconventional chord is tagged into a family (Tanava 6, Kamala 2, Sankula 3, Panka 3)", () => {
    const counts = { kamala: 0, tanava: 0, panka: 0, sankula: 0 };
    for (const chord of UNCONVENTIONAL_CHORDS) {
      expect(chord.family).toBeDefined();
      counts[chord.family!] += 1;
    }
    expect(counts).toEqual({ tanava: 6, kamala: 2, sankula: 3, panka: 3 });
    // Outliers explicitly assigned to Tanava.
    expect(chordByAbbr("ChrClst")!.family).toBe("tanava");
    expect(chordByAbbr("F32")!.family).toBe("tanava");
  });

  it("chordPool filters by family and gates standard triads", () => {
    // A single family flag returns exactly that family, no Major/minor.
    const tanava = chordPool({ tanava: true });
    expect(tanava.map((c) => c.abbr).sort()).toEqual(
      ["ChrClst", "F32", "Tan", "kTan", "mTan", "rTan"].sort()
    );
    // Standard gates Major & minor.
    expect(chordPool({}).map((c) => c.abbr)).not.toContain("Maj");
    const std = chordPool({ standard: true }).map((c) => c.abbr);
    expect(std).toContain("Maj");
    expect(std).toContain("min");
    expect(std).not.toContain("Aug");
  });
});

describe("scales", () => {
  it("Major scale in C -> C D E F G A B", () => {
    const major = scaleById("major")!;
    expect(names(major.fromRoot)).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
  });

  it("pentatonic #31 = 1214 -> C C# D# E G#", () => {
    const p31 = PENTATONIC_SCALES.find((s) => s.index === 31)!;
    expect(p31.code).toBe("1214");
    expect(names(p31.fromRoot)).toEqual(["C", "C#", "D#", "E", "G#"]);
    expect(names(pentatonicFromCode("1214"))).toEqual(["C", "C#", "D#", "E", "G#"]);
  });

  it("pentatonic index is complete: 66 entries, all 5-note", () => {
    expect(PENTATONIC_SCALES.length).toBe(66);
    for (const s of PENTATONIC_SCALES) expect(s.fromRoot.length).toBe(5);
  });

  it("pentatonic index has no modal synonyms (66 distinct necklaces)", () => {
    const necklaces = new Set(PENTATONIC_SCALES.map((s) => canonicalNecklace(s.fromRoot)));
    expect(necklaces.size).toBe(66);
  });

  it("heptatonic scales all have 7 notes", () => {
    for (const s of HEPTATONIC_SCALES) expect(s.fromRoot.length).toBe(7);
  });

  it("new less-common scales have the expected pitch classes from root", () => {
    // Neapolitan Major on C = C Db Eb F G A B
    expect(scaleById("neapolitan-major")!.fromRoot).toEqual([0, 1, 3, 5, 7, 9, 11]);
    // Neapolitan Minor on C = C Db Eb F G Ab B
    expect(scaleById("neapolitan-minor")!.fromRoot).toEqual([0, 1, 3, 5, 7, 8, 11]);
    // Enigmatic on C = C Db E F# G# A# B
    expect(scaleById("enigmatic")!.fromRoot).toEqual([0, 1, 4, 6, 8, 10, 11]);
    // Harmonic Major on C = C Db Eb E G Ab Bb
    expect(scaleById("harmonic-major")!.fromRoot).toEqual([0, 1, 3, 4, 7, 8, 10]);
  });

  it("only Major and Natural minor are in the 'common' subfamily", () => {
    const common = HEPTATONIC_SCALES.filter((s) => s.subfamily === "common").map((s) => s.id);
    expect(common).toEqual(["major", "natural-minor"]);
  });
});

describe("tool 1: chords in scale", () => {
  const major = scaleById("major")!;
  const found = chordsInScale(major, C);

  function has(name: string) {
    return found.some((r) => r.name === name);
  }

  it("C Major includes I=C Maj, IV=F Maj, V=G Maj", () => {
    expect(has("C Maj")).toBe(true);
    expect(has("F Maj")).toBe(true);
    expect(has("G Maj")).toBe(true);
  });

  it("C Major includes ii=D min, iii=E min, vi=A min", () => {
    expect(has("D min")).toBe(true);
    expect(has("E min")).toBe(true);
    expect(has("A min")).toBe(true);
  });

  it("does not include chords with out-of-scale notes (C# never appears)", () => {
    for (const r of found) {
      expect(r.notes).not.toContain(1); // C#
    }
  });

  it("functions: C Maj is T, G Maj is D, F Maj is PD", () => {
    expect(found.find((r) => r.name === "C Maj")!.func).toBe("T");
    expect(found.find((r) => r.name === "G Maj")!.func).toBe("D");
    expect(found.find((r) => r.name === "F Maj")!.func).toBe("PD");
  });
});

describe("tool 2: scale overlap", () => {
  it("C Major + A Natural minor share the same notes (aliased together)", () => {
    // Keep the C major triad notes; both C Major and A Natural minor contain them.
    const matches = scaleOverlap([0, 4, 7], { pentatonic: false, heptatonic: true });
    const cMajorMatch = matches.find((m) =>
      m.aliases.some((a) => a.name === "C Major")
    );
    expect(cMajorMatch).toBeTruthy();
    expect(cMajorMatch!.aliases.some((a) => a.name === "A Natural minor")).toBe(true);
  });

  it("every returned scale actually contains the kept notes", () => {
    const kept = [0, 2, 4];
    const matches = scaleOverlap(kept, { pentatonic: true, heptatonic: true });
    for (const m of matches) {
      for (const k of kept) expect(m.notes).toContain(k);
    }
  });
});

describe("tool 3: transition chords", () => {
  it("pivot chords lie inside the intersection of both scales", () => {
    const cMajor = scaleById("major")!;
    const gMajor = scaleById("major")!;
    const { common, chords } = transitionChords(cMajor, 0, gMajor, 7);
    // C major and G major differ only by F/F#; common excludes F(5) and F#(6).
    expect(common).not.toContain(5);
    expect(common).not.toContain(6);
    for (const c of chords) {
      for (const n of c.notes) expect(common).toContain(n);
    }
    // C Maj uses F? no -> {0,4,7} all common, should be present.
    expect(chords.some((c) => c.name === "C Maj")).toBe(true);
  });
});

describe("functions map", () => {
  it("only the primary offsets (I, IV, V) carry a function", () => {
    expect(functionForRoot(0, 0)).toBe("T"); // I
    expect(functionForRoot(5, 0)).toBe("PD"); // IV
    expect(functionForRoot(7, 0)).toBe("D"); // V
    // Everything else is neutral.
    expect(functionForRoot(2, 0)).toBeNull(); // ii
    expect(functionForRoot(9, 0)).toBeNull(); // vi
    expect(functionForRoot(11, 0)).toBeNull(); // vii
    expect(functionForRoot(1, 0)).toBeNull();
  });
});

describe("v2: chordsInNotes matches chordsInScale", () => {
  it("C major set + tonic 0 equals chordsInScale(major, 0)", () => {
    const major = scaleById("major")!;
    const viaScale = chordsInScale(major, 0);
    const viaNotes = chordsInNotes(scaleNotesAt(major, 0), 0);
    expect(new Set(viaNotes.map((c) => c.id))).toEqual(new Set(viaScale.map((c) => c.id)));
    expect(viaNotes.find((c) => c.name === "C Maj")!.func).toBe("T");
    expect(viaNotes.find((c) => c.name === "G Maj")!.func).toBe("D");
  });
});

describe("generateProgressionFromNotes (Progression Generator)", () => {
  it("builds a T-PD-D progression from the C Major note set", () => {
    const notes = scaleNotesAt(scaleById("major")!, 0);
    const steps: ("T" | "PD" | "D")[] = ["T", "PD", "D"];
    const opts = { standard: true, aug: true, dim: true, sus: false };
    const { pool, slots } = generateProgressionFromNotes(notes, 0, steps, opts);
    // Pool is the same as the note-set chord list under the same options.
    expect(new Set(pool.map((c) => c.id))).toEqual(
      new Set(chordsInNotes(notes, 0, opts).map((c) => c.id))
    );
    // Every slot gets a chord whose function matches the requested step.
    expect(slots).toHaveLength(3);
    slots.forEach((slot, i) => {
      expect(slot.chord).not.toBeNull();
      expect(slot.chord!.func).toBe(steps[i]);
    });
  });
});

describe("v2: scale identification", () => {
  it("identifyPentatonic on major-pentatonic notes -> #66 (2232)", () => {
    const p = identifyPentatonic([0, 2, 4, 7, 9]);
    expect(p).toEqual({ index: 66, code: "2232" });
  });

  it("namedPentatonicName distinguishes major vs minor at their tonic", () => {
    expect(namedPentatonicName([0, 2, 4, 7, 9], 0)).toBe("Major Pentatonic");
    expect(namedPentatonicName([0, 3, 5, 7, 10], 0)).toBe("Minor Pentatonic");
    // Same necklace / RK index for both.
    expect(identifyPentatonic([0, 3, 5, 7, 10])!.index).toBe(66);
  });

  it("identifyHeptatonic on C major set lists C Major and A Natural minor", () => {
    const notes = scaleNotesAt(scaleById("major")!, 0);
    const hits = identifyHeptatonic(notes, 0);
    const labels = hits.map((h) => `${noteName(h.root)} ${h.name}`);
    expect(labels[0]).toBe("C Major"); // tonic-rooted reading first
    expect(labels).toContain("A Natural minor");
  });

  it("intervalCode of C major is 2212221", () => {
    expect(intervalCode(scaleById("major")!.fromRoot)).toBe("2212221");
  });
});

describe("scaleIdForNotes (map a note set back to a catalog scale)", () => {
  it("identifies C natural minor from its notes at tonic C", () => {
    const notes = scaleNotesAt(scaleById("natural-minor")!, 0);
    expect(scaleIdForNotes(notes, 0)).toBe("natural-minor");
  });

  it("round-trips: notes of a scale at a root resolve back to that scale id", () => {
    const major = scaleNotesAt(scaleById("major")!, 7); // G major
    expect(scaleIdForNotes(major, 7)).toBe("major");
  });

  it("returns null for an arbitrary non-catalog set", () => {
    expect(scaleIdForNotes([0, 1, 2], 0)).toBeNull();
  });
});

describe("spellNote (context-aware enharmonic spelling)", () => {
  it("naturals always keep their letter", () => {
    for (const pc of [0, 2, 4, 5, 7, 9, 11]) {
      expect(spellNote(pc, [])).toBe(noteName(pc));
    }
  });

  it("prefers the flat when the lower natural is taken and the upper is free", () => {
    expect(spellNote(3, [0, 2, 5])).toBe("Eb"); // D present, E absent
  });

  it("prefers the sharp when the upper natural is taken and the lower is free", () => {
    expect(spellNote(3, [0, 4])).toBe("D#"); // E present, D absent
  });

  it("spells diatonic scales conventionally", () => {
    const fMajor = scaleNotesAt(scaleById("major")!, 5); // F G A Bb C D E
    expect(spellNote(10, fMajor)).toBe("Bb");
    const gMajor = scaleNotesAt(scaleById("major")!, 7); // G A B C D E F#
    expect(spellNote(6, gMajor)).toBe("F#");
  });

  it("defaults to sharp on ties (isolated key or both neighbours present)", () => {
    expect(spellNote(6, [0])).toBe("F#"); // neither neighbour present
    expect(spellNote(1, [0, 2])).toBe("C#"); // both C and D present
  });
});

describe("v2: overlapByCommon", () => {
  const notes = scaleNotesAt(scaleById("major")!, 0);
  const overlaps = overlapByCommon(notes, 0, {
    minCommon: 5,
    excludeScaleId: "major",
    excludeRoot: 0,
  });

  it("every result shares >=5 notes", () => {
    for (const o of overlaps) expect(o.common.length).toBeGreaterThanOrEqual(5);
  });

  it("A Natural minor (same 7 notes) is the first row", () => {
    expect(overlaps[0].name).toBe("A Natural minor");
    expect(overlaps[0].common.length).toBe(7);
  });

  it("notes are listed in tonic order (A Natural minor -> A B C D E F G)", () => {
    expect(names(overlaps[0].notes)).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
  });

  it("does not list the exact source scale (C Major)", () => {
    expect(overlaps.some((o) => o.name === "C Major")).toBe(false);
  });

  it("shared chords fit within the shared notes", () => {
    for (const o of overlaps) {
      for (const c of o.sharedChords) {
        for (const n of c.notes) expect(o.common).toContain(n);
      }
    }
  });

  it("scaleChords is a superset of sharedChords (all scale chords available)", () => {
    for (const o of overlaps) {
      const ids = new Set(o.scaleChords.map((c) => c.id));
      for (const c of o.sharedChords) expect(ids.has(c.id)).toBe(true);
      expect(o.scaleChords.length).toBeGreaterThanOrEqual(o.sharedChords.length);
    }
  });

  it("G Major (differs by one note) is among the results", () => {
    expect(overlaps.some((o) => o.name === "G Major")).toBe(true);
  });
});

describe("v2: pivotScales", () => {
  const cMajor = scaleNotesAt(scaleById("major")!, 0);
  const gMajor = scaleNotesAt(scaleById("major")!, 7);
  const pivots = pivotScales(cMajor, 0, gMajor, { minCommon: 5 });

  it("every pivot shares >=5 notes with BOTH source scales", () => {
    const cSet = new Set(cMajor);
    const gSet = new Set(gMajor);
    for (const p of pivots) {
      expect(p.notes.filter((n) => cSet.has(n)).length).toBeGreaterThanOrEqual(5);
      expect(p.notes.filter((n) => gSet.has(n)).length).toBeGreaterThanOrEqual(5);
    }
  });

  it("excludes the two source scales and their note-set twins", () => {
    // C Major / A Natural minor share C major's notes; G Major / E Natural minor share G's.
    for (const name of ["C Major", "A Natural minor", "G Major", "E Natural minor"]) {
      expect(pivots.some((p) => p.name === name)).toBe(false);
    }
  });

  it("highlighted notes are shared with BOTH source scales", () => {
    const cSet = new Set(cMajor);
    const gSet = new Set(gMajor);
    for (const p of pivots)
      for (const n of p.common) {
        expect(cSet.has(n)).toBe(true);
        expect(gSet.has(n)).toBe(true);
      }
  });

  it("D Major is a valid pivot between C and G major", () => {
    expect(pivots.some((p) => p.name === "D Major")).toBe(true);
  });
});

describe("v2: pivotScales highlights only notes common to both sources", () => {
  // Reproduces the reported bug: C Major (main) + B Natural minor (checked).
  // The E Natural minor pivot must not highlight C, which is absent from B minor.
  const cMajor = scaleNotesAt(scaleById("major")!, 0);
  const bMinor = scaleNotesAt(scaleById("natural-minor")!, 11);
  const pivots = pivotScales(cMajor, 0, bMinor, { minCommon: 5 });
  const eMinor = pivots.find((p) => p.name === "E Natural minor");

  it("includes E Natural minor as a pivot", () => {
    expect(eMinor).toBeDefined();
  });

  it("does not highlight C (absent from B Natural minor)", () => {
    expect(eMinor!.common).not.toContain(0); // 0 = C
  });

  it("highlights E, G, A, B, D (shared by all three)", () => {
    for (const pc of [4, 7, 9, 11, 2]) expect(eMinor!.common).toContain(pc);
  });
});

describe("v2: pivotScales truly requires BOTH (distinct sources)", () => {
  const cMajor = scaleNotesAt(scaleById("major")!, 0);
  const dMajor = scaleNotesAt(scaleById("major")!, 2); // shares only 5 notes with C major
  const fMajor = scaleNotesAt(scaleById("major")!, 5);
  const cSet = new Set(cMajor);
  const dSet = new Set(dMajor);
  const pivots = pivotScales(cMajor, 0, dMajor, { minCommon: 5 });

  it("test setup: F major shares 6 with C but only 4 with D", () => {
    expect(fMajor.filter((n) => cSet.has(n)).length).toBe(6);
    expect(fMajor.filter((n) => dSet.has(n)).length).toBe(4);
  });

  it("every pivot shares >=5 with BOTH C major and D major", () => {
    for (const p of pivots) {
      expect(p.notes.filter((n) => cSet.has(n)).length).toBeGreaterThanOrEqual(5);
      expect(p.notes.filter((n) => dSet.has(n)).length).toBeGreaterThanOrEqual(5);
    }
  });

  it("excludes F major, which only shares 4 with D major", () => {
    expect(pivots.some((p) => p.name === "F Major")).toBe(false);
  });
});
