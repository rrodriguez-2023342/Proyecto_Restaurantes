import { adminTheme } from "../../constants/theme";

export const Card = ({ title, action, children, footer, className = "", accent = false }) => {
    return (
        <div
            className={`relative overflow-hidden ${adminTheme.card} ${className}`}
        >
            {accent && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600" />
            )}
            {(title || action) && (
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    {title ? (
                        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                    ) : (
                        <span />
                    )}
                    {action}
                </div>
            )}
            <div className="px-5 py-4">{children}</div>
            {footer && (
                <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                    {footer}
                </div>
            )}
        </div>
    );
};
