import { useState } from "react";

export const DateRangeFilter = ({ onFilter, isExporting, onExportCSV, onExportPDF }) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleFilter = () => {
        if (onFilter) onFilter({ startDate, endDate });
    };

    const handleClear = () => {
        setStartDate("");
        setEndDate("");
        if (onFilter) onFilter({ startDate: null, endDate: null });
    };

    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-4 shadow-sm shadow-slate-200/70 backdrop-blur md:p-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <div className="grid gap-4 md:grid-cols-[minmax(0,220px)_minmax(0,220px)_auto] md:items-end">
                    <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">Fecha inicio</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-12 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">Fecha fin</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="h-12 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleFilter}
                            className="h-12 rounded-2xl bg-slate-950 px-7 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
                        >
                            Filtrar
                        </button>
                        {(startDate || endDate) && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-600 transition hover:bg-slate-100"
                                title="Limpiar filtros"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
                    <button
                        type="button"
                        onClick={onExportCSV}
                        disabled={isExporting}
                        className="h-12 rounded-2xl border border-slate-300 bg-white px-6 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        CSV
                    </button>
                    <button
                        type="button"
                        onClick={onExportPDF}
                        disabled={isExporting}
                        className="h-12 rounded-2xl border border-orange-200 bg-orange-50 px-6 text-sm font-black text-orange-700 transition hover:-translate-y-0.5 hover:border-orange-500 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        PDF
                    </button>
                </div>
            </div>
        </div>
    );
};