import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";

export const RoleRedirect = () => {
    const user = useAuthStore((state) => state.user);
    const role = user?.role;

    if (role === "ADMIN_ROLE" || role === "ADMIN_RESTAURANT_ROLE") {
        return <Navigate to="/admin" replace />;
    }

    if (role === "USER_ROLE") {
        return <Navigate to="/home" replace />;
    }

    return <Navigate to="/unauthorized" replace />;
};
