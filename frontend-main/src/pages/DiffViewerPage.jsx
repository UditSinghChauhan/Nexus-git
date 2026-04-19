import { useEffect, useMemo, useState } from "react";
import { explainDiffWithAI, fetchCommits, fetchDiff } from "../api/vcs";
import DiffFileCard from "../components/diff/DiffFileCard";
import ErrorState from "../components/shared/ErrorState";
import LoadingState from "../components/shared/LoadingState";

const SparklesIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
    <path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z" />
    <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" />
  </svg>
);

export default function DiffViewerPage() {
  const [commits, setCommits] = useState([]);
  const [fromHash, setFromHash] = useState("");
  const [toHash, setToHash] = useState("");
  const [diff, setDiff] = useState(null);
  const [diffExplanation, setDiffExplanation] = useState("");
  const [explainingDiff, setExplainingDiff] = useState(false);
  const [loadingCommits, setLoadingCommits] = useState(true);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCommits()
      .then((result) => {
        setCommits(result);
        if (result.length > 1) {
          // newest = result[0], oldest = result[result.length - 1]
          // Always show from oldest → newest so there's a visible diff
          setFromHash(result[result.length - 1].hash);
          setToHash(result[0].hash);
        }
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoadingCommits(false));
  }, []);

  useEffect(() => {
    if (!fromHash || !toHash) return;
    setDiffExplanation("");
    setError("");
    setLoadingDiff(true);
    fetchDiff(fromHash, toHash)
      .then(setDiff)
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoadingDiff(false));
  }, [fromHash, toHash]);

  const commitOptions = useMemo(
    () =>
      commits.map((commit) => ({
        value: commit.hash,
        label: `${commit.hash.slice(0, 10)}  ·  ${commit.message}`,
      })),
    [commits]
  );

  const totalAdded = diff?.files?.reduce((sum, f) => sum + f.lines.filter((l) => l.type === "added").length, 0) || 0;
  const totalRemoved = diff?.files?.reduce((sum, f) => sum + f.lines.filter((l) => l.type === "removed").length, 0) || 0;

  if (error) return <ErrorState message={error} />;
  if (loadingCommits) return <LoadingState label="Loading diff viewer..." />;

  if (commits.length < 2) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Diff view requires at least two commits. Create more commits with the CLI to compare history.
        </p>
      </div>
    );
  }

  async function handleExplainDiff() {
    setExplainingDiff(true);
    setError("");
    setDiffExplanation("");
    try {
      const result = await explainDiffWithAI(fromHash, toHash);
      setDiffExplanation(result.explanation);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setExplainingDiff(false);
    }
  }

  const selectStyle = {
    background: "var(--bg-muted)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-muted)",
    borderRadius: "8px",
    padding: "10px 12px",
    width: "100%",
    fontSize: "13px",
    fontFamily: "'JetBrains Mono', monospace",
    outline: "none",
    appearance: "auto",
    cursor: "pointer",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Diff Viewer
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
          Select any two commits to inspect line-by-line changes. AI can explain what changed.
        </p>
      </div>

      {/* Commit selectors */}
      <div className="glass-card p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>From (base)</span>
            <select
              id="diff-from"
              value={fromHash}
              onChange={(e) => setFromHash(e.target.value)}
              style={selectStyle}
            >
              {commitOptions.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ background: "#0f1521" }}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>To (target)</span>
            <select
              id="diff-to"
              value={toHash}
              onChange={(e) => setToHash(e.target.value)}
              style={selectStyle}
            >
              {commitOptions.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ background: "#0f1521" }}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {diff && (
          <div className="mt-4 flex items-center gap-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              {diff.files?.length || 0} file{diff.files?.length !== 1 ? "s" : ""} changed
            </span>
            <span className="mono text-sm font-semibold" style={{ color: "#10b981" }}>+{totalAdded}</span>
            <span className="mono text-sm font-semibold" style={{ color: "#f43f5e" }}>−{totalRemoved}</span>
          </div>
        )}
      </div>

      {/* AI Explanation */}
      <div className="glass-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: "var(--accent-violet)" }}><SparklesIcon /></span>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>AI Diff Explanation</h2>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Get a plain-English summary of what changed between the selected commits.
            </p>
          </div>
          <button
            id="explain-diff-btn"
            type="button"
            onClick={handleExplainDiff}
            disabled={explainingDiff}
            className="flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all"
            style={{
              background: explainingDiff ? "var(--bg-muted)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              border: "none",
              cursor: explainingDiff ? "not-allowed" : "pointer",
              opacity: explainingDiff ? 0.7 : 1,
            }}
          >
            <SparklesIcon />
            {explainingDiff ? "Explaining…" : "Explain Diff"}
          </button>
        </div>

        {diffExplanation && (
          <div className="mt-4 rounded-lg p-4 text-sm leading-relaxed animate-fade-in" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", color: "var(--text-secondary)" }}>
            {diffExplanation}
          </div>
        )}
      </div>

      {/* Diff files */}
      {loadingDiff ? (
        <LoadingState label="Computing diff…" />
      ) : (
        <div className="space-y-4">
          {diff?.files?.length ? (
            diff.files.map((file) => <DiffFileCard key={file.name} file={file} />)
          ) : (
            <div className="glass-card p-8 text-center">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No file differences between the selected commits.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
