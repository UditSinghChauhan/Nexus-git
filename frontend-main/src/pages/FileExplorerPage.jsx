import { useEffect, useState } from "react";
import { fetchFileContent, fetchFiles } from "../api/vcs";
import FileList from "../components/files/FileList";
import ErrorState from "../components/shared/ErrorState";
import LoadingState from "../components/shared/LoadingState";

export default function FileExplorerPage() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [fileContent, setFileContent] = useState("");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">File Explorer</h1>
        <p className="mt-2 text-sm text-slate-500">
          Browse files from the current branch and inspect their contents.
        </p>
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
