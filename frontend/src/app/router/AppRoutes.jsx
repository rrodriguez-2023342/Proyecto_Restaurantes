import { Routes, Route } from "react-router-dom";
import { AuthPage } from "../../features/auth/pages/AuthPage.jsx";
import { Principal } from "../layouts/Principal.jsx";
import { VerifyEmailPage } from "../../features/auth/pages/VerifyEmailPage.jsx";
import { RoleGuard } from "./RoleGuard.jsx";
import { UnauthorizatedPage } from "../../features/auth/pages/UnauthorizatedPage.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />}/>
            <Route 
                path="/principal" 
                element={
                    <ProtectedRoute>
                        <RoleGuard allowedRoles={["ADMIN_ROLE", "USER_ROLE", "ADMIN_RESTAURANT_ROLE"]}>
                            <Principal />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            >
            
            </Route>
        </Routes>
    )
}
