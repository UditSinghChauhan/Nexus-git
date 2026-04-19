export default function LoadingState({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div
        className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "rgba(99,102,241,0.3)", borderTopColor: "#6366f1" }}
      />
      <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
  );
}
