import { useState } from "react";
import { ChordsInScaleTool } from "./tools/ChordsInScaleTool";
import { ProgressionGeneratorTool } from "./tools/ProgressionGeneratorTool";

type ToolId = "chords" | "progression";

const TOOLS: { id: ToolId; label: string }[] = [
  { id: "chords", label: "Chords in Scale" },
  { id: "progression", label: "Progression Generator" },
];

export default function App() {
  const [tool, setTool] = useState<ToolId>("chords");

  return (
    <div className="min-h-full bg-neutral-950 text-neutral-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(60rem_40rem_at_70%_-10%,rgba(163,163,163,0.06),transparent)]" />

      <header className="relative border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <button
            onClick={() => setTool("chords")}
            className="flex items-center gap-2 text-lg font-black tracking-tight"
          >
            <span className="grid h-8 w-8 place-items-center bg-ocean-500 font-black text-white">
              E
            </span>
            Euphonator
          </button>
          <nav className="flex flex-wrap gap-1">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={` px-3 py-1.5 text-sm font-medium transition ${
                  tool === t.id
                    ? "bg-ocean-500 text-white"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-6">
        {tool === "chords" && <ChordsInScaleTool />}
        {tool === "progression" && <ProgressionGeneratorTool />}
      </main>

      <footer className="relative mx-auto max-w-7xl px-4 py-8 text-xs text-neutral-500">
        Euphonator — a semitone-first music theory cheat sheet. All chord and scale
        math follows the Ram Kalo system.
      </footer>
    </div>
  );
}
