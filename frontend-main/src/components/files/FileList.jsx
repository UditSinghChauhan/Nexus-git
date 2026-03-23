import React from "react";
export default function FileList({ files, selectedFile, onSelect }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
        Files
      </div>
      <ul className="divide-y divide-slate-100">
        {files.map((file) => (
          <li key={file.name}>
            <button
              type="button"
              onClick={() => onSelect(file.name)}
              className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm ${
                selectedFile === file.name ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
            >
              <span className="font-medium text-slate-800">{file.name}</span>
              <span className="text-xs text-slate-500">{file.size} bytes</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
