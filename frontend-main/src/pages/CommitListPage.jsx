import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCommitDetails, fetchCommits } from "../api/vcs";
import CommitGraph from "../components/commits/CommitGraph";
import CommitTable from "../components/commits/CommitTable";
import ErrorState from "../components/shared/ErrorState";
import LoadingState from "../components/shared/LoadingState";
import useVcsRealtime from "../hooks/useVcsRealtime";

const GitMergeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
    <path d="M6 21V9a9 9 0 0 0 9 9" />
  </svg>
);

export default function CommitListPage() {
  const { hash } = useParams();
  const navigate = useNavigate();
  const [commits, setCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [loadingCommits, setLoadingCommits] = useState(true);
  const [error, setError] = useState("");

  function loadCommits() {
    fetchCommits()
      .then((result) => setCommits(result))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoadingCommits(false));
  }

  useEffect(() => { loadCommits(); }, []);

  useEffect(() => {
    if (!hash) { setSelectedCommit(null); return; }
    fetchCommitDetails(hash)
      .then(setSelectedCommit)
      .catch((err) => setError(err.response?.data?.error || err.message));
  }, [hash]);

  useVcsRealtime(() => {
    loadCommits();
    if (hash) {
      fetchCommitDetails(hash)
        .then(setSelectedCommit)
        .catch((err) => setError(err.response?.data?.error || err.message));
    }
  });

  if (error) return <ErrorState message={error} />;
  if (loadingCommits) return <LoadingState label="Loading commits..." />;

  if (!commits.length) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No commits exist yet. Run <code className="mono rounded px-1.5 py-0.5 text-xs" style={{ background: "var(--bg-muted)", color: "var(--accent-indigo)" }}>node cli.js commit "message"</code> to create your first commit.
        </p>
      </div>
    );
  }

  function handleCommitSelect(commitHash) {
    navigate(`/commits/${commitHash}`);
  }

  const isMergeCommit = Boolean(selectedCommit?.parent2);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Commit History
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
          Browse branch history, inspect commit metadata, and traverse parent chains.
        </p>
      </div>

      <CommitGraph commits={commits} selectedHash={hash} onSelect={handleCommitSelect} />
      <CommitTable commits={commits} selectedHash={hash} />

      {/* Commit detail panel */}
      {selectedCommit && (
        <div className="glass-card p-6 animate-slide-in">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
              Commit Detail
            </h2>
            {isMergeCommit && (
              <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: "rgba(245,158,11,0.15)", color: "var(--accent-amber)", border: "1px solid rgba(245,158,11,0.25)" }}>
                <GitMergeIcon /> Merge Commit
              </span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Hash", value: selectedCommit.hash, mono: true },
              { label: "Message", value: selectedCommit.message },
              { label: "Timestamp", value: new Date(selectedCommit.timestamp).toLocaleString() },
              { label: "Parent 1", value: selectedCommit.parent1 || selectedCommit.parent || "None (root commit)", mono: true },
              ...(selectedCommit.parent2 ? [{ label: "Parent 2", value: selectedCommit.parent2, mono: true }] : []),
              ...(selectedCommit.files?.length ? [{ label: "Files", value: selectedCommit.files.join("  ·  "), mono: false }] : []),
            ].map(({ label, value, mono }) => (
              <div key={label} className="rounded-lg p-4" style={{ background: "var(--bg-muted)", border: "1px solid var(--border-subtle)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
                <p className={`text-sm break-all ${mono ? "mono" : ""}`} style={{ color: "var(--text-primary)" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
