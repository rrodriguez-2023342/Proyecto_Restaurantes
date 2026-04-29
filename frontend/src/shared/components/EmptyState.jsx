export const EmptyState = ({ title = "Sin resultados", description, actionLabel, onAction }) => {
    return (
        <div className="rounded-2xl border border-dashed border-orange-200 bg-gradient-to-br from-white via-white to-orange-50 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-slate-700">{title}</p>
            {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
            {actionLabel && (
                <button
                    type="button"
                    onClick={onAction}
                    className="mt-4 rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-400 transition"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};
