import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import ScreenContainer from "@/src/components/ScreenContainer";
import { colors } from "@/src/constants/colors";
import { useAuth } from "@/src/contexts/AuthContext";

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert("Atenção", "Preencha e-mail e senha.");
      return;
    }

    try {
      setLoading(true);
      await signIn(email, senha);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Erro ao entrar", error?.message ?? "Falha no login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Cifra Clave</Text>
          <Text style={styles.subtitle}>
            Entre para acessar as músicas, pastas e cifras.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              placeholder="seuemail@exemplo.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              placeholder="Digite sua senha"
              placeholderTextColor={colors.textMuted}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              style={styles.input}
            />

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && { opacity: 0.85 },
                loading && { opacity: 0.6 },
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Entrando..." : "Entrar"}
              </Text>
            </Pressable>

            <Pressable onPress={() => router.push("/register")}>
              <Text style={styles.link}>Não tem conta? Criar conta</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 20,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    marginBottom: 24,
    lineHeight: 22,
  },
  form: {
    gap: 10,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 15,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  link: {
    color: colors.primary,
    marginTop: 16,
    textAlign: "center",
    fontWeight: "600",
  },
});