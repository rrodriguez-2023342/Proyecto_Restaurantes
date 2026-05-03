export const EmptyState = ({ title = "Sin resultados", description, actionLabel, onAction }) => {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h16M4 12h16M4 17h10" />
                </svg>
            </div>
            <p className="text-sm font-medium text-slate-700">{title}</p>
            {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
            {actionLabel && (
                <button
                    type="button"
                    onClick={onAction}
                    className="mt-5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-orange-400 hover:to-orange-500"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};
