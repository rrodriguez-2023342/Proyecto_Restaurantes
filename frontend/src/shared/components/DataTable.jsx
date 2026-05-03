import { EmptyState } from "./EmptyState.jsx";

export const DataTable = ({ columns = [], rows = [], rowKey = "id", emptyLabel }) => {
    if (!rows.length) {
        return <EmptyState title={emptyLabel || "Sin datos disponibles"} />;
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} className="border-b border-slate-200 px-4 py-3 font-semibold">
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row) => (
                            <tr
                                key={row[rowKey]}
                                className="text-slate-700 transition hover:bg-slate-50"
                            >
                                {columns.map((column) => (
                                    <td key={column.key} className="px-4 py-3">
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
