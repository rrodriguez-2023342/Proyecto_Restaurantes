import { Routes, Route } from "react-router-dom";
import { AuthPage } from "../../features/auth/pages/AuthPage.jsx";
import { VerifyEmailPage } from "../../features/auth/pages/VerifyEmailPage.jsx";
import { UnauthorizatedPage } from "../../features/auth/pages/UnauthorizatedPage.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { RoleGuard } from "./RoleGuard.jsx";
import { RoleRedirect } from "./RoleRedirect.jsx";
import { AdminLayout } from "../layouts/AdminLayout.jsx";
import { PublicLayout } from "../layouts/PublicLayout.jsx";
import { AdminDashboard } from "../../features/dashboard/pages/AdminDashboard.jsx";
import { UserHome } from "../../features/home/pages/UserHome.jsx";
import { RestaurantsPage } from "../../features/restaurants/pages/RestaurantsPage.jsx";
import { RestaurantDetail } from "../../features/restaurants/pages/RestaurantDetail.jsx";
import { MenusPage } from "../../features/menus/pages/MenusPage.jsx";
import { ReviewsPage } from "../../features/reviews/pages/ReviewsPage.jsx";
import { UsersPage } from "../../features/users/pages/UsersPage.jsx";
import { StatisticsPage } from "../../features/dashboard/pages/StatisticsPage.jsx";
import { ResetPasswordPage } from "../../features/auth/pages/ResetPasswordPage.jsx";

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />}/>
            <Route path="/unauthorized" element={<UnauthorizatedPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
                path="/principal"
                element={
                    <ProtectedRoute>
                        <RoleRedirect />
                    </ProtectedRoute>
                }
            />

            <Route
                element={
                    <ProtectedRoute>
                        <RoleGuard allowedRoles={["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"]}>
                            <AdminLayout />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            >
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/restaurants" element={<RestaurantsPage />} />
                <Route path="/admin/restaurants/:id" element={<RestaurantDetail />} />
                <Route path="/admin/menus" element={<MenusPage />} />
                <Route path="/admin/reviews" element={<ReviewsPage />} />
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/stats" element={<StatisticsPage />} />
            </Route>

            <Route
                element={
                    <ProtectedRoute>
                        <RoleGuard allowedRoles={["USER_ROLE"]}>
                            <PublicLayout />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            >
                <Route path="/home" element={<UserHome />} />
                <Route path="/home/restaurants/:id" element={<RestaurantDetail />} />
                <Route path="/home/reviews" element={<ReviewsPage />} />
                <Route path="/home/stats" element={<StatisticsPage />} />
            </Route>
        </Routes>
    )
}
