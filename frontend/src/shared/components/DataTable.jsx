import { EmptyState } from "./EmptyState.jsx";

export const DataTable = ({ columns = [], rows = [], rowKey = "id", emptyLabel }) => {
    if (!rows.length) {
        return <EmptyState title={emptyLabel || "Sin datos disponibles"} />;
    }

    return (
        <div className="admin-card overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.72)]">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-950 text-[10px] uppercase tracking-[0.24em] text-slate-300">
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} className="border-b border-slate-800 px-5 py-4 font-black">
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row) => (
                            <tr
                                key={row[rowKey]}
                                className="text-slate-700 transition hover:bg-amber-50/60"
                            >
                                {columns.map((column) => (
                                    <td key={column.key} className="px-5 py-4 align-middle font-medium">
                                        {column.render ? column.render(row) : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
