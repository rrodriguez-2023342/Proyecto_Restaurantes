import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RestaurantsScreen from "../features/restaurants/screens/RestaurantsScreen";
import RestaurantMenuScreen from "../features/restaurants/screens/RestaurantMenuScreen";
import RestaurantReservationScreen from "../features/restaurants/screens/RestaurantReservationScreen";
import RestaurantReviewsScreen from "../features/restaurants/screens/RestaurantReviewsScreen";
import UserReservationsScreen from "../features/restaurants/screens/UserReservationsScreen";
import CartScreen from "../features/restaurants/screens/CartScreen";
import CheckoutScreen from "../features/restaurants/screens/CheckoutScreen";
import MyOrdersScreen from "../features/restaurants/screens/MyOrdersScreen";
import OrderDetailScreen from "../features/restaurants/screens/OrderDetailScreen";
import InvoicesScreen from "../features/restaurants/screens/InvoicesScreen";
import InvoiceDetailScreen from "../features/restaurants/screens/InvoiceDetailScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";

const Stack = createNativeStackNavigator();

const MainStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="RestaurantsHome" component={RestaurantsScreen} />
            <Stack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} />
            <Stack.Screen name="RestaurantReservation" component={RestaurantReservationScreen} />
            <Stack.Screen name="RestaurantReviews" component={RestaurantReviewsScreen} />
            <Stack.Screen name="UserReservations" component={UserReservationsScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="Invoices" component={InvoicesScreen} />
            <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
    );
};

export default MainStack;
