type SemesterSpineEntry = {
  semester: string;
  metric: string;
  note: string;
};

interface SemesterSpineProps {
  entries: SemesterSpineEntry[];
  title?: string;
  compact?: boolean;
}

export function SemesterSpine({
  entries,
  title = '학기별 흐름',
  compact = false,
}: SemesterSpineProps) {
  return (
    <div className={`page-panel-muted ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-kicker">학기 비교</p>
          <h3 className={`${compact ? 'mt-1 text-lg' : 'mt-1 text-xl'} font-black tracking-tight text-slate-950`}>
            {title}
          </h3>
        </div>
        <span className="primary-chip">학기 흐름</span>
      </div>

      <div className={`mt-4 grid gap-3 ${compact ? '' : 'md:grid-cols-3'}`}>
        {entries.map((entry, index) => (
          <div key={`${entry.semester}-${entry.metric}`} className="relative rounded-[1.2rem] border border-[rgba(15,23,42,0.08)] bg-white p-4">
            {index < entries.length - 1 && !compact && (
              <div className="absolute -right-2 top-1/2 hidden h-px w-4 bg-[#bfd4ea] md:block" />
            )}
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{entry.semester}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{entry.metric}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">{entry.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
