import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Small square "i" button that reveals a short explanatory paragraph. Opens on
 * hover (preview) and click (pins it open). Dismisses on outside click or Esc.
 *
 * The panel is rendered in a portal with fixed positioning so it escapes the
 * cards' `backdrop-blur` stacking contexts and overflow — otherwise it gets
 * painted underneath neighbouring cards. Sharp corners only, neutral styling.
 */
export function InfoButton({
  label = "More information",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const open = pinned || hovered;

  const place = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.min(288, window.innerWidth - 16); // max-w-xs (18rem)
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    setPos({ top: r.bottom + 6, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    place();
    const onScroll = () => place();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, place]);

  useEffect(() => {
    if (!pinned) return;
    function onDown(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setPinned(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPinned(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [pinned]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setPinned((p) => !p)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`grid h-5 w-5 place-items-center border text-[11px] font-bold leading-none transition ${
          open
            ? "border-mist-500 bg-mist-500 text-neutral-900"
            : "border-neutral-600 bg-neutral-800 text-neutral-300 hover:border-neutral-500 hover:text-neutral-100"
        }`}
      >
        i
      </button>
      {open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            role="tooltip"
            style={{ position: "fixed", top: pos.top, left: pos.left }}
            className="z-50 block w-max max-w-xs border border-neutral-700 bg-neutral-900 p-3 text-xs font-normal leading-relaxed text-neutral-200 shadow-xl"
          >
            {children}
          </span>,
          document.body
        )}
    </>
  );
}
