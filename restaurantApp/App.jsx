import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from "react-native-safe-area-context"
import AppNavigator from './src/navigation/AppNavigator';
import { ToastProvider } from './src/shared/components/Toast';

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </ToastProvider>
    </SafeAreaProvider>
  );
}
