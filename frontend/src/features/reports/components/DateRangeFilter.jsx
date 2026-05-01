import { useState } from "react";

export const DateRangeFilter = ({ onFilter, isExporting, onExportCSV, onExportPDF }) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleFilter = () => {
        if (onFilter) {
            onFilter({ startDate, endDate });
        }
    };

    const handleClear = () => {
        setStartDate("");
        setEndDate("");
        if (onFilter) {
            onFilter({ startDate: null, endDate: null });
        }
    };

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-end gap-4 w-full lg:w-auto">
                <div className="w-full sm:w-auto">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fecha Inicio</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="block w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                </div>
                <div className="w-full sm:w-auto">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fecha Fin</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="block w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleFilter}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-sm transition-colors"
                    >
                        Filtrar
                    </button>
                    {(startDate || endDate) && (
                        <button
                            onClick={handleClear}
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition-colors"
                            title="Limpiar filtros"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
                <button
                    onClick={onExportCSV}
                    disabled={isExporting}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-300 hover:border-orange-500 text-slate-700 hover:text-orange-600 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CSV
                </button>
                <button
                    onClick={onExportPDF}
                    disabled={isExporting}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-50 border border-orange-200 hover:border-orange-500 text-orange-700 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF
                </button>
            </div>
        </div>
    );
};
