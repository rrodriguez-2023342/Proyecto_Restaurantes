export const FormField = ({ label, error, hint, children, className = "" }) => {
    return (
        <label className={`block ${className}`}>
            {label && (
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {label}
                </span>
            )}
            {children}
            {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </label>
    );
};
