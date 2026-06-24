import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RestaurantsScreen from "../features/restaurants/screens/RestaurantsScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";

const Stack = createNativeStackNavigator();

const MainStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="RestaurantsHome" component={RestaurantsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
    );
};

export default MainStack;