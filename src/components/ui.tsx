import { ReactNode } from "react";
import { HarmonicFunction } from "../theory/functions";

// --- Function colour system (Tonic / Pre-Dominant / Dominant) ------------

export const FUNCTION_STYLE: Record<
  HarmonicFunction,
  { chip: string; ring: string; text: string; dot: string; name: string }
> = {
  T: {
    chip: "bg-coral-500/15 text-coral-400 border border-coral-500/40",
    ring: "ring-coral-400",
    text: "text-coral-400",
    dot: "bg-coral-400",
    name: "Tonic",
  },
  PD: {
    chip: "bg-kelp-500/20 text-kelp-400 border border-kelp-500/50",
    ring: "ring-kelp-400",
    text: "text-kelp-400",
    dot: "bg-kelp-400",
    name: "Pre-Dominant",
  },
  D: {
    chip: "bg-reef-500/15 text-reef-400 border border-reef-500/40",
    ring: "ring-reef-400",
    text: "text-reef-400",
    dot: "bg-reef-400",
    name: "Dominant",
  },
};

/** Colour key for the note/function palette (T / PD / D + neutral). */
export function FunctionLegend({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2 text-xs ${className}`}>
      {(["T", "PD", "D"] as const).map((f) => (
        <span key={f} className={`px-3 py-1 font-semibold ${FUNCTION_STYLE[f].chip}`}>
          {f} · {FUNCTION_STYLE[f].name}
        </span>
      ))}
      <span className="border border-ocean-500/40 bg-ocean-500/15 px-3 py-1 font-semibold text-ocean-300">
        Other note
      </span>
    </div>
  );
}

// --- Panel ----------------------------------------------------------------

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={` border border-neutral-800 bg-neutral-900/60 shadow-xl backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">
      {children}
    </div>
  );
}

// --- Segmented control ----------------------------------------------------

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm";
  return (
    <div className="inline-flex flex-wrap gap-1  bg-neutral-800/70 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`${pad}  font-medium transition ${
            value === o.value
              ? "bg-ocean-500 text-white shadow"
              : "text-neutral-300 hover:bg-neutral-700/60"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// --- Toggle ---------------------------------------------------------------

export function Toggle({
  checked,
  onChange,
  label,
  accent = "bg-reef-500",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  accent?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2  border px-3 py-1.5 text-sm font-medium transition ${
        checked
          ? "border-neutral-600 bg-neutral-800 text-neutral-100"
          : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-neutral-200"
      }`}
    >
      <span
        className={`h-3.5 w-3.5  ${checked ? accent : "bg-neutral-600"}`}
      />
      {label}
    </button>
  );
}

// --- Note chip ------------------------------------------------------------

export function NoteChip({
  name,
  variant = "default",
  size = "md",
}: {
  name: string;
  variant?: "default" | "tonic" | "kept" | "extra" | "muted";
  size?: "sm" | "md";
}) {
  const styles: Record<string, string> = {
    default: "bg-neutral-800 text-neutral-100 border-neutral-700",
    tonic: "bg-coral-500/20 text-coral-400 border-coral-500/50",
    kept: "bg-ocean-500/25 text-ocean-300 border-ocean-500/50",
    extra: "bg-neutral-800/40 text-neutral-400 border-neutral-700 border-dashed",
    muted: "bg-neutral-800/50 text-neutral-400 border-neutral-700",
  };
  const pad = size === "sm" ? "h-6 min-w-6 px-1.5 text-xs" : "h-8 min-w-8 px-2 text-sm";
  return (
    <span
      className={`inline-flex items-center justify-center  border font-semibold ${pad} ${styles[variant]}`}
    >
      {name}
    </span>
  );
}
