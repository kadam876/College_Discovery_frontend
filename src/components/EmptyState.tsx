interface Props {
  title: string;
  description: string;
  onReset?: () => void;
}

export function EmptyState({ title, description, onReset }: Props) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-8 py-16 text-center">
      <div className="mb-4 text-5xl opacity-60" aria-hidden>
        🔍
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-slate-400">{description}</p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
        >
          Reset filters
        </button>
      )}
    </div>
  );
}
