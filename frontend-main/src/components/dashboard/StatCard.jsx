import { useEffect, useRef } from "react";

const icons = {
  repo: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  branch: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  ),
  commit: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="1.05" y1="12" x2="7" y2="12" />
      <line x1="17.01" y1="12" x2="22.96" y2="12" />
    </svg>
  ),
  hash: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  ),
};

const accentMap = {
  repo:   { bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.3)",  text: "#6366f1" },
  branch: { bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)",  text: "#10b981" },
  commit: { bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.3)",  text: "#8b5cf6" },
  hash:   { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)",  text: "#f59e0b" },
};

export default function StatCard({ label, value, subtext, icon = "repo", updated }) {
  const ref = useRef(null);
  const accent = accentMap[icon] || accentMap.repo;

  useEffect(() => {
    if (!ref.current || !updated) return;
    ref.current.classList.add("ring-2");
    ref.current.style.setProperty("--tw-ring-color", accent.border);
    const t = setTimeout(() => {
      if (ref.current) ref.current.classList.remove("ring-2");
    }, 1200);
    return () => clearTimeout(t);
  }, [updated, accent.border]);

  return (
    <div
      ref={ref}
      className="glass-card animate-fade-in p-5 transition-all duration-300"
      style={{ transition: "box-shadow 0.3s ease, border-color 0.3s ease" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
            {label}
          </p>
          <p className="mt-3 break-all text-xl font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
            {value || "—"}
          </p>
          {subtext && (
            <p className="mt-1.5 truncate font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
              {subtext}
            </p>
          )}
        </div>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: accent.bg, color: accent.text, border: `1px solid ${accent.border}` }}>
          {icons[icon]}
        </div>
      </div>
    </div>
  );
}
