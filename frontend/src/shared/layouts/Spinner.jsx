
export const Spinner = ({ small = false, label = "" }) => {
    if (small) {
        return (
            <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {label && <span className="text-sm font-medium">{label}</span>}
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500"></div>
                {label && <p className="text-slate-600 text-sm font-medium">{label}</p>}
            </div>
        </div>
    );
}