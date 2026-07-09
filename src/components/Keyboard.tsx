import { PitchClass, noteName } from "../theory/notes";

export type KeyVariant =
  | "accent"
  | "root"
  | "kept"
  | "extra"
  | "T"
  | "PD"
  | "D"
  | "chord";

export interface KeyHighlight {
  variant: KeyVariant;
  label?: string;
}

const WHITE_PCS: PitchClass[] = [0, 2, 4, 5, 7, 9, 11];
// Black key sits to the right of these white-key indices.
const BLACK_AFTER: { whiteIndex: number; pc: PitchClass }[] = [
  { whiteIndex: 0, pc: 1 },
  { whiteIndex: 1, pc: 3 },
  { whiteIndex: 3, pc: 6 },
  { whiteIndex: 4, pc: 8 },
  { whiteIndex: 5, pc: 10 },
];

const WHITE_STYLE: Record<KeyVariant | "off", string> = {
  off: "bg-neutral-100 text-neutral-500",
  accent: "bg-ocean-400 text-ocean-ink",
  root: "bg-coral-500 text-white",
  kept: "bg-ocean-400 text-ocean-ink",
  extra: "bg-neutral-300 text-neutral-600",
  chord: "bg-sun-400 text-sun-ink",
  T: "bg-coral-400 text-white",
  PD: "bg-kelp-400 text-kelp-ink",
  D: "bg-reef-400 text-reef-ink",
};

const BLACK_STYLE: Record<KeyVariant | "off", string> = {
  off: "bg-neutral-900 text-neutral-500",
  accent: "bg-ocean-500 text-white",
  root: "bg-coral-500 text-white",
  kept: "bg-ocean-500 text-white",
  extra: "bg-neutral-700 text-neutral-300",
  chord: "bg-sun-500 text-sun-ink",
  T: "bg-coral-500 text-white",
  PD: "bg-kelp-500 text-white",
  D: "bg-reef-500 text-white",
};

export function Keyboard({
  highlights = {},
  onKeyClick,
  showLabels = true,
  height = 150,
}: {
  highlights?: Record<number, KeyHighlight>;
  onKeyClick?: (pc: PitchClass) => void;
  showLabels?: boolean;
  height?: number;
}) {
  const clickable = !!onKeyClick;
  const whiteW = 100 / WHITE_PCS.length;

  return (
    <div
      className="relative w-full select-none"
      style={{ height }}
      role="group"
      aria-label="Piano keyboard"
    >
      {/* White keys */}
      <div className="absolute inset-0 flex gap-[3px]">
        {WHITE_PCS.map((pc) => {
          const h = highlights[pc];
          const style = WHITE_STYLE[h?.variant ?? "off"];
          return (
            <button
              key={pc}
              disabled={!clickable}
              onClick={() => onKeyClick?.(pc)}
              className={`relative flex-1  border border-neutral-300/60 shadow-sm transition ${style} ${
                clickable ? "cursor-pointer hover:brightness-95" : "cursor-default"
              }`}
            >
              {showLabels && (
                <span className="pointer-events-none absolute inset-x-0 bottom-1.5 text-center text-[11px] font-bold">
                  {h?.label ?? noteName(pc)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Black keys */}
      {BLACK_AFTER.map(({ whiteIndex, pc }) => {
        const h = highlights[pc];
        const style = BLACK_STYLE[h?.variant ?? "off"];
        const left = `calc(${(whiteIndex + 1) * whiteW}% - ${whiteW * 0.32}%)`;
        return (
          <button
            key={pc}
            disabled={!clickable}
            onClick={() => onKeyClick?.(pc)}
            style={{ left, width: `${whiteW * 0.64}%`, height: height * 0.62 }}
            className={`absolute top-0 z-10  border border-black/50 shadow-lg transition ${style} ${
              clickable ? "cursor-pointer hover:brightness-110" : "cursor-default"
            }`}
          >
            {showLabels && h && (
              <span className="pointer-events-none absolute inset-x-0 bottom-1 text-center text-[9px] font-bold">
                {h.label ?? noteName(pc)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
