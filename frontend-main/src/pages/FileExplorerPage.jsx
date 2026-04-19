import { useEffect, useState } from "react";
import { fetchFileContent, fetchFiles, suggestCommitMessage } from "../api/vcs";
import FileList from "../components/files/FileList";
import ErrorState from "../components/shared/ErrorState";
import LoadingState from "../components/shared/LoadingState";

const SparklesIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
    <path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z" />
    <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" />
  </svg>
);

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

function getFileLanguage(name) {
  const ext = name?.split(".").pop()?.toLowerCase();
  const langMap = { js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript", json: "json", md: "markdown", html: "html", css: "css", py: "python", txt: "text" };
  return langMap[ext] || "text";
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function FileExplorerPage() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [suggestedMessage, setSuggestedMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFiles()
      .then((result) => {
        setFiles(result);
        if (result[0]) setSelectedFile(result[0].name);
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoadingFiles(false));
  }, []);

  useEffect(() => {
    if (!selectedFile) return;
    fetchFileContent(selectedFile)
      .then((result) => {
        setFileContent(result.content);
        setFileSize(new Blob([result.content]).size);
      })
      .catch((err) => setError(err.response?.data?.error || err.message));
  }, [selectedFile]);

  if (error) return <ErrorState message={error} />;
  if (loadingFiles) return <LoadingState label="Loading files..." />;

  if (!files.length) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No tracked files yet. Run <code className="mono rounded px-1.5 py-0.5 text-xs" style={{ background: "var(--bg-muted)", color: "var(--accent-indigo)" }}>node cli.js add &lt;file&gt;</code> and commit to populate the explorer.
        </p>
      </div>
    );
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

  function handleCopyContent() {
    navigator.clipboard.writeText(fileContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const lang = getFileLanguage(selectedFile);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          File Explorer
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
          Browse files from the current branch head snapshot.
        </p>
      </div>

      {/* AI commit message */}
      <div className="glass-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: "var(--accent-violet)" }}><SparklesIcon /></span>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>AI Commit Message</h2>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Generate a semantic commit message from staged file changes.
            </p>
          </div>
          <button
            id="suggest-commit-btn"
            type="button"
            onClick={handleSuggestCommitMessage}
            disabled={loadingMessage}
            className="flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all"
            style={{
              background: loadingMessage ? "var(--bg-muted)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              border: "none",
              cursor: loadingMessage ? "not-allowed" : "pointer",
              opacity: loadingMessage ? 0.7 : 1,
            }}
          >
            <SparklesIcon />
            {loadingMessage ? "Generating…" : "Suggest Message"}
          </button>
        </div>

        {suggestedMessage && (
          <div className="mt-4 rounded-lg p-4 animate-fade-in" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <p className="mono text-sm" style={{ color: "var(--text-secondary)" }}>{suggestedMessage}</p>
          </div>
        )}
      </div>

      {/* File browser */}
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <FileList files={files} selectedFile={selectedFile} onSelect={setSelectedFile} />

        {/* Content viewer */}
        <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border-subtle)" }}>
          {/* Content header */}
          <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center gap-2 min-w-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="mono text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{selectedFile || "Select a file"}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: "rgba(99,102,241,0.15)", color: "var(--accent-indigo)" }}>
                {lang}
              </span>
              {fileSize > 0 && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatBytes(fileSize)}</span>
              )}
              <button
                type="button"
                onClick={handleCopyContent}
                title="Copy file content"
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors"
                style={{ background: "var(--bg-muted)", color: copied ? "var(--accent-emerald)" : "var(--text-muted)", border: "1px solid var(--border-subtle)" }}
              >
                <CopyIcon />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Code */}
          <pre
            className="mono min-h-[460px] overflow-auto text-xs leading-relaxed"
            style={{ background: "#070a10", color: "#a5b4d4", padding: "20px 24px", margin: 0 }}
          >
            {fileContent
              ? fileContent.split("\n").map((line, i) => (
                  <div key={i} className="flex" style={{ minHeight: "20px" }}>
                    <span className="select-none mr-6 text-right" style={{ color: "#2d3a52", minWidth: "28px", flexShrink: 0 }}>{i + 1}</span>
                    <span>{line}</span>
                  </div>
                ))
              : <span style={{ color: "var(--text-muted)" }}>Select a file to view its contents.</span>
            }
          </pre>
        </div>
      </div>
    </div>
  );
}
