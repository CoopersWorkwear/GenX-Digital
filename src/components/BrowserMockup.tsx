/** A faux browser window showing a themed website — used in the hero and as
 * default imagery in generated previews. Pure markup, themed by colours. */
export function BrowserMockup({
  primary,
  accent,
  domain = "yourbusiness.com.au",
  className = "",
}: {
  primary: string;
  accent: string;
  domain?: string;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/60 ${className}`}>
      <div className="flex items-center gap-1.5 bg-slate-100 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        <span className="ml-3 truncate rounded bg-white px-3 py-1 text-xs text-slate-400">
          {domain}
        </span>
      </div>
      <div
        className="px-6 py-8 text-white"
        style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
      >
        <div className="h-3 w-20 rounded bg-white/80" />
        <div className="mt-3 h-5 w-44 rounded bg-white/90" />
        <div className="mt-2 h-2.5 w-52 rounded bg-white/50" />
        <div className="mt-4 h-7 w-28 rounded-lg bg-white" />
      </div>
      <div className="grid grid-cols-3 gap-3 p-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-slate-100 p-3">
            <div
              className="h-7 w-7 rounded-lg"
              style={{ background: hexToRgba(accent, 0.18) }}
            />
            <div className="mt-2 h-2 w-full rounded bg-slate-100" />
            <div className="mt-1 h-2 w-2/3 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
