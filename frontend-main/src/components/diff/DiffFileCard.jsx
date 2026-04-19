import { useState } from "react";

const lineStyles = {
  added:   { bg: "rgba(16,185,129,0.08)",  text: "#10b981",  prefix: "+" },
  removed: { bg: "rgba(244,63,94,0.08)",   text: "#f43f5e",  prefix: "−" },
  context: { bg: "transparent",             text: "#8b9ec7",  prefix: " " },
};

function countChanges(lines) {
  return lines.reduce(
    (acc, l) => {
      if (l.type === "added") acc.added += 1;
      else if (l.type === "removed") acc.removed += 1;
      return acc;
    },
    { added: 0, removed: 0 }
  );
}

export default function DiffFileCard({ file }) {
  const [collapsed, setCollapsed] = useState(false);
  const { added, removed } = countChanges(file.lines);

  // Build line numbers for each side
  let leftLine = 0;
  let rightLine = 0;

  const linesWithNumbers = file.lines.map((line) => {
    let left = null;
    let right = null;
    if (line.type === "removed") {
      leftLine += 1;
      left = leftLine;
    } else if (line.type === "added") {
      rightLine += 1;
      right = rightLine;
    } else {
      leftLine += 1;
      rightLine += 1;
      left = leftLine;
      right = rightLine;
    }
    return { ...line, left, right };
  });

  return (
    <section
      className="animate-fade-in overflow-hidden rounded-xl"
      style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}
    >
      {/* File header */}
      <div
        className="flex items-center justify-between px-5 py-3 cursor-pointer select-none"
        style={{ borderBottom: collapsed ? "none" : "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="mono text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
            {file.name}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {added > 0 && (
            <span className="rounded px-2 py-0.5 mono text-[11px] font-bold" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
              +{added}
            </span>
          )}
          {removed > 0 && (
            <span className="rounded px-2 py-0.5 mono text-[11px] font-bold" style={{ background: "rgba(244,63,94,0.12)", color: "#f43f5e" }}>
              −{removed}
            </span>
          )}
          <span style={{ color: "var(--text-muted)", transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.2s ease", display: "inline-block" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </span>
        </div>
      </div>

      {/* Diff lines */}
      {!collapsed && (
        <div className="divide-y overflow-x-auto" style={{ divideColor: "rgba(99,120,167,0.06)" }}>
          {linesWithNumbers.map((line, index) => {
            const style = lineStyles[line.type];
            return (
              <div
                key={`${file.name}-${index}`}
                className="grid"
                style={{ gridTemplateColumns: "36px 36px 18px 1fr", background: style.bg }}
              >
                {/* Left line number */}
                <span
                  className="mono select-none text-right py-1.5 px-2 text-[11px]"
                  style={{ color: "var(--text-muted)", borderRight: "1px solid rgba(99,120,167,0.08)", background: "#090d17" }}
                >
                  {line.left ?? ""}
                </span>
                {/* Right line number */}
                <span
                  className="mono select-none text-right py-1.5 px-2 text-[11px]"
                  style={{ color: "var(--text-muted)", borderRight: "1px solid rgba(99,120,167,0.08)", background: "#090d17" }}
                >
                  {line.right ?? ""}
                </span>
                {/* +/- prefix */}
                <span
                  className="mono select-none text-center py-1.5 text-[12px] font-bold"
                  style={{ color: style.text, borderRight: "1px solid rgba(99,120,167,0.08)" }}
                >
                  {style.prefix}
                </span>
                {/* Content */}
                <span
                  className="mono whitespace-pre-wrap py-1.5 px-4 text-xs"
                  style={{ color: line.type === "context" ? "var(--text-secondary)" : style.text }}
                >
                  {line.content || " "}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
