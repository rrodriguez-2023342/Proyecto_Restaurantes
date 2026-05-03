import { useState } from "react";
import { adminTheme } from "../../../constants/theme";

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
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <div className="grid gap-4 md:grid-cols-[minmax(0,220px)_minmax(0,220px)_auto] md:items-end">
                    <label>
                        <span className={adminTheme.label}>Fecha inicio</span>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`mt-2 w-full ${adminTheme.input}`} />
                    </label>
                    <label>
                        <span className={adminTheme.label}>Fecha fin</span>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={`mt-2 w-full ${adminTheme.input}`} />
                    </label>
                    <div className="flex gap-2">
                        <button type="button" onClick={handleFilter} className={adminTheme.primaryButton}>
                            Filtrar
                        </button>
                        {(startDate || endDate) && (
                            <button type="button" onClick={handleClear} className={adminTheme.neutralButton}>
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
                    <button type="button" onClick={onExportCSV} disabled={isExporting} className={adminTheme.outlineButton}>
                        CSV
                    </button>
                    <button type="button" onClick={onExportPDF} disabled={isExporting} className={adminTheme.outlineButton}>
                        PDF
                    </button>
                </div>
            </div>
        </div>
    );
};
