interface ScoreCircleProps {
  label: string;
  score: number;
}

export function ScoreCircle({ label, score }: ScoreCircleProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-5">
      <div
        className="mx-auto flex size-28 items-center justify-center rounded-full p-2"
        style={{ background: `conic-gradient(#3b82f6 ${score * 3.6}deg, #1e293b 0deg)` }}
      >
        <div className="flex size-full items-center justify-center rounded-full bg-slate-900 text-3xl font-semibold text-slate-50">
          {score || "--"}
        </div>
      </div>
      <p className="mt-4 text-center text-sm font-semibold text-slate-300">{label}</p>
    </div>
  );
}
