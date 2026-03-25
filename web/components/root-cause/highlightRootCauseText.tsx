import { Fragment, type ReactNode } from "react";

/**
 * Splits text on optional phrases (longest match first) and wraps matches in a subtle <mark>.
 */
export function highlightRootCauseText(
  text: string,
  phrases: string[] | undefined,
): ReactNode {
  const trimmed = (phrases ?? []).map((p) => p.trim()).filter(Boolean);
  if (trimmed.length === 0) {
    return text;
  }

  const sorted = [...trimmed].sort((a, b) => b.length - a.length);
  const escaped = sorted.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");

  const parts = text.split(re);

  return parts.map((part, i) => {
    const matched = sorted.some((p) => part.toLowerCase() === p.toLowerCase());
    if (matched) {
      return (
        <mark
          key={i}
          className="rounded-sm bg-slate-100 px-0.5 font-semibold text-slate-900"
        >
          {part}
        </mark>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
