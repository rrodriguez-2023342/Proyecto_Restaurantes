import { adminTheme } from "../../constants/theme";

export const Card = ({ title, action, children, footer, className = "", accent = false }) => {
    return (
        <div
            className={`group relative overflow-hidden transition duration-300 ${adminTheme.card} ${className}`}
        >
            {accent && (
                <div className="absolute inset-x-0 top-0 h-1 bg-slate-950" />
            )}
            {(title || action) && (
                <div className="admin-panel-heading flex items-center justify-between border-b border-slate-900 px-5 py-4">
                    {title ? (
                        <h3 className="text-[11px] font-black uppercase tracking-[0.28em] text-white">{title}</h3>
                    ) : (
                        <span />
                    )}
                    {action}
                </div>
            )}
            <div className="px-5 py-5">{children}</div>
            {footer && (
                <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-semibold text-slate-500">
                    {footer}
                </div>
            )}
        </div>
    );
};
