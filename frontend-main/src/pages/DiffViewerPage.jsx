import React from "react";
import { useEffect, useMemo, useState } from "react";
import { explainDiffWithAI, fetchCommits, fetchDiff } from "../api/vcs";
import DiffFileCard from "../components/diff/DiffFileCard";
import ErrorState from "../components/shared/ErrorState";
import LoadingState from "../components/shared/LoadingState";

export default function DiffViewerPage() {
  const [commits, setCommits] = useState([]);
  const [fromHash, setFromHash] = useState("");
  const [toHash, setToHash] = useState("");
  const [diff, setDiff] = useState(null);
  const [diffExplanation, setDiffExplanation] = useState("");
  const [explainingDiff, setExplainingDiff] = useState(false);
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

    setDiffExplanation("");
    setError("");
    fetchDiff(fromHash, toHash)
      .then(setDiff)
      .catch((err) => setError(err.response?.data?.error || err.message));
  }, [fromHash, toHash]);

  const commitOptions = useMemo(
    () =>
      commits.map((commit) => ({
        value: commit.hash,
        label: `${commit.hash.slice(0, 12)} - ${commit.message}`,
      })),
    [commits]
  );

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!commits.length) {
    return <LoadingState label="Loading diff viewer..." />;
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
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              AI Diff Explanation
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Get a plain-English summary of the selected commit diff.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExplainDiff}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            {explainingDiff ? "Explaining..." : "Explain Diff"}
          </button>
        </div>
        {diffExplanation ? (
          <div className="mt-4 rounded-md bg-slate-100 px-4 py-3 text-sm text-slate-700">
            {diffExplanation}
          </div>
        ) : null}
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
