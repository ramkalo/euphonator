import { useState } from "react";
import { ScaleExplorerTool } from "./tools/ScaleExplorerTool";
import { ProgressionGeneratorTool } from "./tools/ProgressionGeneratorTool";
import { useScaleSelection } from "./tools/useScaleSelection";

type ToolId = "chords" | "progression";

const TOOLS: { id: ToolId; label: string }[] = [
  { id: "chords", label: "Scale Explorer" },
  { id: "progression", label: "Progression Generator" },
];

export default function App() {
  const [tool, setTool] = useState<ToolId>("chords");
  // One scale selection, made in Scale Explorer, shared with the Progression Generator.
  const scale = useScaleSelection();

  return (
    <div className="min-h-full bg-neutral-950 text-neutral-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(60rem_40rem_at_70%_-10%,rgba(163,163,163,0.06),transparent)]" />

      <header className="relative border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <button
            onClick={() => setTool("chords")}
            className="flex items-center gap-2 text-lg font-black tracking-tight"
          >
            <span className="grid h-8 w-8 place-items-center bg-mist-500 font-black text-neutral-900">
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
                    ? "bg-mist-500 text-neutral-900"
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
        {tool === "chords" && <ScaleExplorerTool scale={scale} />}
        {tool === "progression" && <ProgressionGeneratorTool scale={scale} />}
      </main>

      <footer className="relative mx-auto max-w-7xl px-4 py-8 text-xs text-neutral-500">
        Euphonator — a semitone-first music theory cheat sheet. All chord and scale
        math follows the Ram Kalo system. To be clear, Ram Kalo is probably just some guy from just some place and all the provided information on this page is, at best, highly suspect. Definitely do not use this tool for your music course homework.
      </footer>
    </div>
  );
}
