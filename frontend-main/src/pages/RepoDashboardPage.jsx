import { useEffect, useState } from "react";
import { fetchDashboard } from "../api/vcs";
import StatCard from "../components/dashboard/StatCard";
import ErrorState from "../components/shared/ErrorState";
import LoadingState from "../components/shared/LoadingState";
import useVcsRealtime from "../hooks/useVcsRealtime";

const GitBranchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const ZapIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function formatTimeAgo(ts) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function RepoDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [updateKey, setUpdateKey] = useState(0);

  function loadDashboard() {
    fetchDashboard()
      .then((data) => {
        setDashboard(data);
        setUpdateKey((k) => k + 1);
      })
      .catch((err) => setError(err.response?.data?.error || err.message));
  }

  useEffect(() => { loadDashboard(); }, []);
  useVcsRealtime(loadDashboard);

  if (error) return <ErrorState message={error} />;
  if (!dashboard) return <LoadingState label="Loading repository dashboard..." />;

  const totalBranches = dashboard.branches?.length || 0;
  const commitHash = dashboard.lastCommit?.hash;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Repository Dashboard
            </h1>
            <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: "rgba(16,185,129,0.12)", color: "var(--accent-emerald)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <span className="live-dot h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent-emerald)" }} />
              Live
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Real-time overview of repository state — updates instantly on every CLI commit.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Repository"
          value={dashboard.repoName}
          icon="repo"
          updated={updateKey}
        />
        <StatCard
          label="Current Branch"
          value={dashboard.currentBranch}
          icon="branch"
          updated={updateKey}
        />
        <StatCard
          label="Latest Commit"
          value={dashboard.lastCommit?.message || "No commits yet"}
          subtext={commitHash ? commitHash.slice(0, 20) + "…" : undefined}
          icon="commit"
          updated={updateKey}
        />
      </div>

      {/* Branches section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
              Branches
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              All branches with their latest commit heads.
            </p>
          </div>
          <span className="rounded-full px-3 py-1 text-xs font-semibold mono" style={{ background: "rgba(99,102,241,0.15)", color: "var(--accent-indigo)", border: "1px solid rgba(99,102,241,0.25)" }}>
            {totalBranches} branch{totalBranches !== 1 ? "es" : ""}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.branches?.map((branch) => (
            <div
              key={branch.name}
              className="rounded-xl p-4 transition-all duration-200"
              style={
                branch.isCurrent
                  ? {
                      background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))",
                      border: "1px solid rgba(99,102,241,0.4)",
                    }
                  : {
                      background: "var(--bg-muted)",
                      border: "1px solid var(--border-subtle)",
                    }
              }
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span style={{ color: branch.isCurrent ? "var(--accent-indigo)" : "var(--text-muted)" }}>
                    <GitBranchIcon />
                  </span>
                  <span className="font-semibold truncate text-sm" style={{ color: "var(--text-primary)" }}>
                    {branch.name}
                  </span>
                </div>
                {branch.isCurrent && (
                  <span className="flex items-center gap-1 flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: "rgba(99,102,241,0.25)", color: "var(--accent-indigo)" }}>
                    <CheckIcon /> HEAD
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed line-clamp-2" style={{ color: branch.isCurrent ? "rgba(226,232,245,0.7)" : "var(--text-secondary)" }}>
                {branch.lastCommitMessage || "No commits yet"}
              </p>
              {branch.head && (
                <p className="mt-2 mono text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                  {branch.head.slice(0, 24)}…
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent commits activity feed */}
      {dashboard.lastCommit && (
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: "var(--text-muted)" }}>
            Latest Activity
          </h2>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <ZapIcon />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {dashboard.lastCommit.message}
                </span>
                <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 mono text-[10px] font-semibold" style={{ color: "var(--accent-indigo)" }}>
                  {dashboard.lastCommit.hash?.slice(0, 8)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                <ClockIcon />
                <span>{formatTimeAgo(dashboard.lastCommit.timestamp)}</span>
                <span>·</span>
                <span className="font-medium" style={{ color: "var(--accent-indigo)" }}>{dashboard.currentBranch}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center gap-2 text-xs" style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
            <span className="live-dot h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent-emerald)" }} />
            Dashboard auto-refreshes on every CLI commit via Socket.io
          </div>
        </div>
      )}
    </div>
  );
}
