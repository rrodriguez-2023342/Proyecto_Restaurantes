import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RestaurantsScreen from "../features/restaurants/screens/RestaurantsScreen";
import RestaurantMenuScreen from "../features/restaurants/screens/RestaurantMenuScreen";
import RestaurantReservationScreen from "../features/restaurants/screens/RestaurantReservationScreen";
import RestaurantReviewsScreen from "../features/restaurants/screens/RestaurantReviewsScreen";
import UserReservationsScreen from "../features/restaurants/screens/UserReservationsScreen";
import CartScreen from "../features/restaurants/screens/CartScreen";
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
            <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
    );
};

export default MainStack;
