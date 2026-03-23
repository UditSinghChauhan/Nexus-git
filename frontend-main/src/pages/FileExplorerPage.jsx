import React from "react";
import { useEffect, useState } from "react";
import { fetchFileContent, fetchFiles, suggestCommitMessage } from "../api/vcs";
import FileList from "../components/files/FileList";
import ErrorState from "../components/shared/ErrorState";
import LoadingState from "../components/shared/LoadingState";

export default function FileExplorerPage() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [suggestedMessage, setSuggestedMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFiles()
      .then((result) => {
        setFiles(result);
        if (result[0]) {
          setSelectedFile(result[0].name);
        }
      })
      .catch((err) => setError(err.response?.data?.error || err.message));
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    fetchFileContent(selectedFile)
      .then((result) => setFileContent(result.content))
      .catch((err) => setError(err.response?.data?.error || err.message));
  }, [selectedFile]);

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!files.length && !selectedFile) {
    return <LoadingState label="Loading files..." />;
  }

  async function handleSuggestCommitMessage() {
    setLoadingMessage(true);
    setError("");
    setSuggestedMessage("");

    try {
      const result = await suggestCommitMessage();
      setSuggestedMessage(result.message);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoadingMessage(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">File Explorer</h1>
        <p className="mt-2 text-sm text-slate-500">
          Browse files from the current branch and inspect their contents.
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              AI Commit Message
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Generate a concise commit message from the current staged changes.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSuggestCommitMessage}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            {loadingMessage ? "Generating..." : "Suggest Commit Message"}
          </button>
        </div>
        {suggestedMessage ? (
          <div className="mt-4 rounded-md bg-slate-100 px-4 py-3 text-sm text-slate-700">
            {suggestedMessage}
          </div>
        ) : null}
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <FileList files={files} selectedFile={selectedFile} onSelect={setSelectedFile} />
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
            {selectedFile || "File content"}
          </div>
          <pre className="min-h-[420px] overflow-auto bg-slate-950 px-4 py-4 text-sm text-slate-100">
            {fileContent}
          </pre>
        </div>
      </div>
    </div>
  );
}
