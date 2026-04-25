import { colors } from "@/src/constants/colors";
import { AlertProvider } from "@/src/contexts/AlertContext";
import { AuthProvider, useAuth } from "@/src/contexts/AuthContext";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

function RootNavigator() {
  const { loading, firebaseUser } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!firebaseUser ? (
        <Stack.Screen name="(auth)" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AlertProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </AlertProvider>
  );
}