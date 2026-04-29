
export const PrincipalContainer = ({ children, className = "" }) => {
    return (
        <main className={`min-h-screen bg-slate-50 text-slate-900 ${className}`}>
            {children}
        </main>
    )
}
