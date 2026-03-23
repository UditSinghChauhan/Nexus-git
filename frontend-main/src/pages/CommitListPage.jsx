import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCommitDetails, fetchCommits } from "../api/vcs";
import CommitTable from "../components/commits/CommitTable";
import ErrorState from "../components/shared/ErrorState";
import LoadingState from "../components/shared/LoadingState";

export default function CommitListPage() {
  const { hash } = useParams();
  const [commits, setCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCommits()
      .then((result) => {
        setCommits(result);
      })
      .catch((err) => setError(err.response?.data?.error || err.message));
  }, []);

  useEffect(() => {
    if (!hash) {
      setSelectedCommit(null);
      return;
    }

    fetchCommitDetails(hash)
      .then(setSelectedCommit)
      .catch((err) => setError(err.response?.data?.error || err.message));
  }, [hash]);

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!commits.length) {
    return <LoadingState label="Loading commits..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Commit List</h1>
        <p className="mt-2 text-sm text-slate-500">
          Review branch history and inspect commit metadata.
        </p>
      </div>
      <CommitTable commits={commits} selectedHash={hash} />
      {selectedCommit ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Commit Details
          </h2>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Hash:</span> {selectedCommit.hash}
            </p>
            <p>
              <span className="font-semibold">Message:</span> {selectedCommit.message}
            </p>
            <p>
              <span className="font-semibold">Timestamp:</span>{" "}
              {new Date(selectedCommit.timestamp).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Parent 1:</span>{" "}
              {selectedCommit.parent1 || selectedCommit.parent || "None"}
            </p>
            <p>
              <span className="font-semibold">Parent 2:</span>{" "}
              {selectedCommit.parent2 || "None"}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
