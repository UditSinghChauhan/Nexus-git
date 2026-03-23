import { useEffect, useMemo, useState } from "react";
import { fetchCommits, fetchDiff } from "../api/vcs";
import DiffFileCard from "../components/diff/DiffFileCard";
import ErrorState from "../components/shared/ErrorState";
import LoadingState from "../components/shared/LoadingState";

export default function DiffViewerPage() {
  const [commits, setCommits] = useState([]);
  const [fromHash, setFromHash] = useState("");
  const [toHash, setToHash] = useState("");
  const [diff, setDiff] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCommits()
      .then((result) => {
        setCommits(result);
        if (result.length > 1) {
          setToHash(result[0].hash);
          setFromHash(result[1].hash);
        }
      })
      .catch((err) => setError(err.response?.data?.error || err.message));
  }, []);

  useEffect(() => {
    if (!fromHash || !toHash) {
      return;
    }

    fetchDiff(fromHash, toHash)
      .then(setDiff)
      .catch((err) => setError(err.response?.data?.error || err.message));
  }, [fromHash, toHash]);

  const commitOptions = useMemo(
    () =>
      commits.map((commit) => ({
        value: commit.hash,
        label: `${commit.hash.slice(0, 12)} — ${commit.message}`,
      })),
    [commits]
  );

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!commits.length) {
    return <LoadingState label="Loading diff viewer..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Diff Viewer</h1>
        <p className="mt-2 text-sm text-slate-500">
          Compare any two commits and inspect added and removed lines.
        </p>
      </div>
      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium">From</span>
          <select
            value={fromHash}
            onChange={(event) => setFromHash(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            {commitOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium">To</span>
          <select
            value={toHash}
            onChange={(event) => setToHash(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            {commitOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="space-y-4">
        {diff?.files?.length ? (
          diff.files.map((file) => <DiffFileCard key={file.name} file={file} />)
        ) : (
          <LoadingState label="No file differences for the selected commits." />
        )}
      </div>
    </div>
  );
}
