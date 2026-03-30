import { Redirect } from "expo-router";
import { useAuth } from "@/src/contexts/AuthContext";

export default function Index() {
  const { firebaseUser } = useAuth();

  if (firebaseUser) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}