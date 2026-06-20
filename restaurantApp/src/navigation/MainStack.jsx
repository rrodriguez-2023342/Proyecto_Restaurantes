import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RestaurantsScreen from "../features/restaurants/screens/RestaurantsScreen";

const Stack = createNativeStackNavigator();

const MainStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="RestaurantsHome" component={RestaurantsScreen} />
        </Stack.Navigator>
    );
};

export default MainStack;