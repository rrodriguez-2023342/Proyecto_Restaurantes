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
import { PlatosPage } from "../../features/platos/pages/PlatosPage.jsx";
import { ReviewsPage } from "../../features/reviews/pages/ReviewsPage.jsx";
import { UsersPage } from "../../features/users/pages/UsersPage.jsx";
import { StatisticsPage } from "../../features/dashboard/pages/StatisticsPage.jsx";
import { ResetPasswordPage } from "../../features/auth/pages/ResetPasswordPage.jsx";
import { OrdersPage } from "../../features/orders/pages/OrdersPage.jsx";
import { CreateOrderPage } from "../../features/orders/pages/CreateOrderPage.jsx";
import { OrderDetail } from "../../features/orders/pages/OrderDetail.jsx";
import { DetailOrdersPage } from "../../features/detailOrders/pages/DetailOrdersPage.jsx";
import { UserOrdersPage } from "../../features/orders/pages/UserOrdersPage.jsx";
import { UserOrderDetail } from "../../features/orders/pages/UserOrderDetail.jsx";
import { AdminReservationsPage } from "../../features/reservations/pages/AdminReservationsPage.jsx";
import { ReservationsPage } from "../../features/reservations/pages/ReservationsPage.jsx";
import { CreateReservationPage } from "../../features/reservations/pages/CreateReservationPage.jsx";
import { TablesPage } from "../../features/tables/pages/TablesPage.jsx";
import { InvoicesPage } from "../../features/invoices/pages/InvoicesPage.jsx";
import { InvoiceDetail } from "../../features/invoices/pages/InvoiceDetail.jsx";
import { ReportsDashboard } from "../../features/reports/pages/ReportsDashboard.jsx";
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
                <Route path="/admin/platos" element={<PlatosPage />} />
                <Route path="/admin/reviews" element={<ReviewsPage />} />
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/stats" element={<StatisticsPage />} />
                <Route path="/admin/orders" element={<OrdersPage />} />
                <Route path="/admin/orders/create" element={<CreateOrderPage />} />
                <Route path="/admin/orders/:id" element={<OrderDetail />} />
                <Route path="/admin/detail-orders" element={<DetailOrdersPage />} />
                <Route path="/admin/reservaciones" element={<AdminReservationsPage />} />
                <Route path="/admin/mesas" element={<TablesPage />} />
                <Route path="/admin/invoices" element={<InvoicesPage />} />
                <Route path="/admin/invoices/:id" element={<InvoiceDetail />} />
                <Route path="/admin/reports" element={<ReportsDashboard />} />
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
                <Route path="/home/orders" element={<UserOrdersPage />} />
                <Route path="/reservaciones" element={<ReservationsPage />} />
                <Route path="/reservaciones/crear" element={<CreateReservationPage />} />
                <Route path="/home/orders/:id" element={<UserOrderDetail />} />
                <Route path="/home/stats" element={<StatisticsPage />} />
                <Route path="/home/invoices" element={<InvoicesPage />} />
                <Route path="/home/invoices/:id" element={<InvoiceDetail />} />
            </Route>
        </Routes>
    )
}
