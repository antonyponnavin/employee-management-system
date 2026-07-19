type StatCardProps = {
  label: string;
  value: number;
  accent: string;
};

export const StatCard = ({ label, value, accent }: StatCardProps) => {
  return (
    <div className="card p-6">
      <div
        className="mb-4 h-3 w-20 rounded-full"
        style={{ background: accent }}
      />
      <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-4xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
};
