export default function ErrorState({ message }) {
  return (
    <div
      className="animate-fade-in flex items-start gap-3 rounded-xl p-5"
      style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <div>
        <p className="text-sm font-semibold" style={{ color: "#f43f5e" }}>Something went wrong</p>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{message}</p>
      </div>
    </div>
  );
}
