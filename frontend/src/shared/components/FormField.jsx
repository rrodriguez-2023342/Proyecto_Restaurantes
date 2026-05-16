export const FormField = ({ label, error, hint, children, className = "" }) => {
    return (
        <label className={`block ${className}`}>
            {label && (
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.26em] text-slate-500">
                    {label}
                </span>
            )}
            {children}
            {hint && <p className="mt-2 text-xs font-medium text-slate-400">{hint}</p>}
            {error && <p className="mt-2 text-xs font-bold text-rose-500">{error}</p>}
        </label>
    );
};
