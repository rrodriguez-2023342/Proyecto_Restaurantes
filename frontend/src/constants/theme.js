export const adminTheme = {
    card: "admin-card rounded-2xl border border-slate-200/90 bg-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.72)]",
    panel: "admin-card rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_24px_70px_-50px_rgba(15,23,42,0.72)]",
    input: "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10",
    select: "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10",
    primaryButton: "inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-[11px] font-black uppercase tracking-[0.24em] text-white shadow-xl shadow-slate-900/10 transition hover:!bg-amber-500 hover:!text-slate-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
    outlineButton: "inline-flex items-center justify-center rounded-xl border border-amber-500/40 bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-amber-700 transition hover:border-amber-500 hover:bg-amber-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
    neutralButton: "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-950 hover:text-slate-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
    destructiveButton: "inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
    pageTitle: "text-3xl font-black uppercase tracking-tight text-slate-950 md:text-4xl",
    sectionTitle: "text-xl font-black uppercase tracking-tight text-slate-950",
    label: "block text-[10px] font-black uppercase tracking-[0.26em] text-slate-500",
    mutedText: "text-sm font-medium text-slate-500",
};

export const statusClasses = {
    pending: "bg-amber-100 text-amber-700",
    active: "bg-blue-100 text-blue-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-rose-100 text-rose-700",
    neutral: "bg-slate-100 text-slate-700",
};
