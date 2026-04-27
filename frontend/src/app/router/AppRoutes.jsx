import { Routes, Route } from "react-router-dom";
import { AuthPage } from "../../features/auth/pages/AuthPage.jsx";
import { Principal } from "../layouts/Principal.jsx";
import { VerifyEmailPage } from "../../features/auth/pages/VerifyEmailPage.jsx";

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />}/>
            <Route path="/principal" element={<Principal />}>
            
            </Route>
        </Routes>
    )
}
