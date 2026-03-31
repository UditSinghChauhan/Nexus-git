import { useEffect, useState } from "react";
import { fetchDashboard } from "../api/vcs";
import StatCard from "../components/dashboard/StatCard";
import ErrorState from "../components/shared/ErrorState";
import LoadingState from "../components/shared/LoadingState";
import useVcsRealtime from "../hooks/useVcsRealtime";

export default function RepoDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  function loadDashboard() {
    fetchDashboard()
      .then(setDashboard)
      .catch((err) => setError(err.response?.data?.error || err.message));
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useVcsRealtime(loadDashboard);

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!dashboard) {
    return <LoadingState label="Loading repository dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Repo Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">
          Minimal overview of the active repository state.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Repository" value={dashboard.repoName} />
        <StatCard label="Current Branch" value={dashboard.currentBranch} />
        <StatCard
          label="Last Commit"
          value={dashboard.lastCommit?.message || "No commits yet"}
          subtext={dashboard.lastCommit?.hash}
        />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Branches
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Available repository branches and their latest commit heads.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {dashboard.branches?.length || 0} total
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.branches?.map((branch) => (
            <div
              key={branch.name}
              className={`rounded-lg border px-4 py-4 ${
                branch.isCurrent
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-800"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{branch.name}</span>
                {branch.isCurrent ? (
                  <span className="rounded-full bg-white/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                    Active
                  </span>
                ) : null}
              </div>
              <p
                className={`mt-3 text-sm ${
                  branch.isCurrent ? "text-slate-200" : "text-slate-500"
                }`}
              >
                {branch.lastCommitMessage || "No commits yet"}
              </p>
              <p
                className={`mt-2 break-all font-mono text-xs ${
                  branch.isCurrent ? "text-slate-300" : "text-slate-400"
                }`}
              >
                {branch.head || "No HEAD commit"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
