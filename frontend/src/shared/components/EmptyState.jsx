export const EmptyState = ({ title = "Sin resultados", description, actionLabel, onAction }) => {
    return (
        <div className="admin-card flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-[0_24px_70px_-50px_rgba(15,23,42,0.72)]">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h16M4 12h16M4 17h10" />
                </svg>
            </div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">{title}</p>
            {description && <p className="mt-3 max-w-md text-sm font-medium text-slate-500">{description}</p>}
            {actionLabel && (
                <button
                    type="button"
                    onClick={onAction}
                    className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-[11px] font-black uppercase tracking-[0.24em] text-white transition hover:bg-amber-500 hover:text-slate-950"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};
