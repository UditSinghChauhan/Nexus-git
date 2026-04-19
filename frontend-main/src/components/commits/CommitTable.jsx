import { useState } from "react";
import { Link } from "react-router-dom";

const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center justify-center rounded p-1 transition-colors"
      title="Copy hash"
      style={{ color: copied ? "var(--accent-emerald)" : "var(--text-muted)", background: "transparent" }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

export default function CommitTable({ commits, selectedHash }) {
  return (
    <div className="animate-fade-in overflow-hidden rounded-xl" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>Hash</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>Message</th>
              <th className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] md:table-cell" style={{ color: "var(--text-muted)" }}>Parents</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {commits.map((commit, idx) => {
              const isSelected = selectedHash === commit.hash;
              const isHead = idx === 0;
              const isMerge = Boolean(commit.parent2);

              return (
                <tr
                  key={commit.hash}
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    background: isSelected ? "rgba(99,102,241,0.08)" : "transparent",
                    transition: "background 0.15s ease",
                  }}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/commits/${commit.hash}`}
                        className="mono text-xs font-semibold transition-colors hover:underline"
                        style={{ color: isSelected ? "var(--accent-indigo)" : "var(--text-secondary)" }}
                      >
                        {commit.hash.slice(0, 12)}
                      </Link>
                      <CopyButton text={commit.hash} />
                      {isHead && (
                        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ background: "rgba(99,102,241,0.2)", color: "var(--accent-indigo)" }}>
                          HEAD
                        </span>
                      )}
                      {isMerge && (
                        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ background: "rgba(245,158,11,0.15)", color: "var(--accent-amber)" }}>
                          Merge
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm" style={{ color: "var(--text-primary)" }}>{commit.message}</span>
                  </td>
                  <td className="hidden px-5 py-3 md:table-cell">
                    <span className="mono text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {commit.parent1 || commit.parent ? (commit.parent1 || commit.parent).slice(0, 8) : "—"}
                      {commit.parent2 ? ` + ${commit.parent2.slice(0, 8)}` : ""}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(commit.timestamp).toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
