import React from "react";
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
    </div>
  );
}
