import { Link } from "react-router-dom";

export default function CommitTable({ commits, selectedHash }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
          <tr>
            <th className="px-4 py-3">Hash</th>
            <th className="px-4 py-3">Message</th>
            <th className="px-4 py-3">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {commits.map((commit) => (
            <tr key={commit.hash} className={selectedHash === commit.hash ? "bg-slate-50" : ""}>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">
                <Link to={`/commits/${commit.hash}`} className="hover:text-slate-900">
                  {commit.hash.slice(0, 12)}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-700">{commit.message}</td>
              <td className="px-4 py-3 text-slate-500">
                {new Date(commit.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
