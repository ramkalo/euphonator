import { HarmonicFunction, RomanLabel } from "../theory/functions";
import { FUNCTION_STYLE } from "./ui";

export function FunctionBadge({
  func,
  size = "md",
}: {
  func: HarmonicFunction | null;
  size?: "sm" | "md";
}) {
  const pad = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";
  if (!func) {
    return (
      <span
        className={`inline-flex items-center  border border-neutral-700 bg-neutral-800/60 font-semibold text-neutral-400 ${pad}`}
      >
        —
      </span>
    );
  }
  const s = FUNCTION_STYLE[func];
  return (
    <span
      className={`inline-flex items-center gap-1  font-semibold ${s.chip} ${pad}`}
      title={s.name}
    >
      <span className={`h-1.5 w-1.5  ${s.dot}`} />
      {func}
    </span>
  );
}

export function RomanBadge({ roman }: { roman: RomanLabel }) {
  return (
    <span className="font-display text-lg font-bold tracking-tight text-neutral-100">
      {roman.numeral}
      {roman.suffix && (
        <sup className="ml-0.5 text-[10px] font-semibold text-neutral-400">
          {roman.suffix}
        </sup>
      )}
    </span>
  );
}
