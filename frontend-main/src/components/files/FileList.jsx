function getFileIcon(name) {
  const ext = name?.split(".").pop()?.toLowerCase();
  const color = {
    js: "#f59e0b", jsx: "#06b6d4", ts: "#3b82f6", tsx: "#06b6d4",
    json: "#10b981", md: "#8b9ec7", html: "#f97316", css: "#8b5cf6",
    py: "#10b981", txt: "#8b9ec7",
  }[ext] || "#566380";
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function FileList({ files, selectedFile, onSelect }) {
  return (
    <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Files</span>
        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(99,102,241,0.15)", color: "var(--accent-indigo)" }}>
          {files.length}
        </span>
      </div>

      <ul>
        {files.map((file) => {
          const isSelected = selectedFile === file.name;
          return (
            <li key={file.name} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <button
                type="button"
                id={`file-${file.name}`}
                onClick={() => onSelect(file.name)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors"
                style={{
                  background: isSelected ? "rgba(99,102,241,0.1)" : "transparent",
                  borderLeft: isSelected ? "2px solid #6366f1" : "2px solid transparent",
                  color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                <span className="flex-shrink-0">{getFileIcon(file.name)}</span>
                <span className="flex-1 truncate font-medium mono text-xs">{file.name}</span>
                <span className="flex-shrink-0 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {formatBytes(file.size)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
