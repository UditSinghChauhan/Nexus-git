const lineStyles = {
  added: "bg-emerald-50 text-emerald-700",
  removed: "bg-rose-50 text-rose-700",
  context: "bg-white text-slate-600",
};

const linePrefix = {
  added: "+",
  removed: "-",
  context: " ",
};

export default function DiffFileCard({ file }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
        {file.name}
      </div>
      <div className="divide-y divide-slate-100 font-mono text-xs">
        {file.lines.map((line, index) => (
          <div key={`${file.name}-${index}`} className={`grid grid-cols-[40px_1fr] ${lineStyles[line.type]}`}>
            <span className="border-r border-slate-200 px-3 py-2 text-center">
              {linePrefix[line.type]}
            </span>
            <span className="whitespace-pre-wrap px-3 py-2">{line.content || " "}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
