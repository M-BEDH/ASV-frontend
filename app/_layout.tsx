import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import '../styles/index.css';
import '../styles/font.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
