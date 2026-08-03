import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getEntry, localize } from "../education/glossary.js";
import { useLearn } from "../context/LearnContext.jsx";
import { ReadBands, LiveReading } from "./Explain.jsx";

const MARGIN = 8; // keep this far from the viewport edges

// A small ⓘ icon that opens a concise popover for a glossary `entryKey`.
// The popover renders in a portal with viewport-clamped fixed positioning, so
// it never gets clipped by scrollable/overflow-hidden ancestors (tables, cards)
// and never runs off the screen edge.
// Optional `reading` ({ value, signal, meaning }) shows the live interpretation.
export default function InfoTip({ entryKey, reading, className = "" }) {
  const { openGlossary, lang } = useLearn();
  const entry = localize(getEntry(entryKey), lang);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null); // { left, top, width, placement, arrowLeft }
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const learnMore = lang === "hi" ? "और जानें →" : "Learn more →";

  const place = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(320, vw - 2 * MARGIN);
    const iconCenter = r.left + r.width / 2;

    // Horizontal: center on the icon, then clamp into the viewport. When the
    // icon sits near an edge (very common — these appear inside dense stat
    // grids), the box shifts away from directly-under-the-icon; the arrow
    // below keeps it visually anchored so it doesn't just look like a
    // random floating box overlapping unrelated cards.
    let left = iconCenter - width / 2;
    left = Math.max(MARGIN, Math.min(left, vw - width - MARGIN));

    // Arrow position relative to the box, clamped to stay within its rounded corners.
    const arrowLeft = Math.max(14, Math.min(iconCenter - left, width - 14));

    // Vertical: prefer below; flip above when there's more room there.
    const spaceBelow = vh - r.bottom;
    const spaceAbove = r.top;
    const placement = spaceBelow < 240 && spaceAbove > spaceBelow ? "above" : "below";
    const top = placement === "below" ? r.bottom + 10 : r.top - 10;

    setPos({ left, top, width, placement, arrowLeft });
  }, []);

  // Position before paint to avoid a flash at the wrong spot.
  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const reposition = () => place();
    window.addEventListener("keydown", onKey);
    // Reposition on scroll/resize so the popover tracks its icon.
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, place]);

  if (!entry) return null;

  return (
    <span className={"inline-flex align-middle " + className}>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label={`What is ${entry.title}?`}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-muted/50 text-muted hover:text-neutral hover:border-neutral text-[10px] font-bold leading-none transition-colors"
      >
        i
      </button>

      {open &&
        pos &&
        createPortal(
          <>
            {/* click-away backdrop — dimmed so the popover reads as a floating
                overlay on top of the page, not as a stray box overlapping cards.
                A fixed dark scrim (not bg-bg) so it's visible in both themes —
                bg-bg would match the page's own background almost exactly and
                render with no visible contrast at all. */}
            <div
              className="fixed inset-0 z-[70] bg-black/25"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            />
            {/* Connecting arrow — the box gets clamped away from directly-under-
                the-icon whenever the icon sits near a viewport edge (common in
                dense stat grids), so without this it looks like an unrelated
                floating box rather than a tooltip anchored to its (i) icon.
                A rotated square, half-covered by the popover box itself (lower
                z-index, box has an opaque background) is simpler and more
                robust than nested CSS border-triangles for getting a clean
                bordered tip at this size — the box's own edge does the work
                of clipping it to a single point. */}
            <div
              aria-hidden="true"
              className="z-[79]"
              style={{
                position: "fixed",
                left: pos.left + pos.arrowLeft - 6,
                top: pos.top - 6,
                width: 12,
                height: 12,
                background: "rgb(var(--c-card))",
                border: "2px solid rgb(var(--c-border))",
                transform: "rotate(45deg)",
              }}
            />
            <div
              ref={popRef}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                left: pos.left,
                top: pos.top,
                width: pos.width,
                transform: pos.placement === "above" ? "translateY(-100%)" : "none",
                maxHeight: "70vh",
                overflowY: "auto",
              }}
              className="z-[80] bg-card border-2 border-border rounded-xl p-3 shadow-2xl text-left cursor-default"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="font-bold text-sm text-txt">{entry.title}</span>
                <span className="text-[9px] uppercase tracking-wide text-muted border border-border rounded px-1 py-0.5 shrink-0">
                  {entry.level}
                </span>
              </div>
              <p className="text-xs text-txt/85 mb-2">{entry.short}</p>

              {reading && (
                <div className="mb-2">
                  <LiveReading reading={reading} />
                </div>
              )}

              {entry.read?.length > 0 && (
                <div className="mb-2">
                  <ReadBands read={entry.read} />
                </div>
              )}

              {entry.analogy && (
                <p className="text-[11px] italic text-neutral/90 mb-2">
                  💡 {entry.analogy}
                </p>
              )}

              <button
                onClick={() => {
                  setOpen(false);
                  openGlossary(entry.key);
                }}
                className="text-[11px] font-semibold text-neutral hover:underline"
              >
                {learnMore}
              </button>
            </div>
          </>,
          document.body
        )}
    </span>
  );
}
