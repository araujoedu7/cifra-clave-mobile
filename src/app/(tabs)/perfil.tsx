import ScreenContainer from "@/src/components/ScreenContainer";
import { colors } from "@/src/constants/colors";
import { useAlert } from "@/src/contexts/AlertContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function PerfilScreen() {
  const { appUser, logout } = useAuth();
  const alert = useAlert();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      alert.showAlert({
        title: "Erro",
        message: "Não foi possível sair da conta.",
      });
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Meu perfil</Text>
        <Text style={styles.subtitle}>
          Veja as informações da sua conta e gerencie sua sessão.
        </Text>

        <View style={styles.card}>
          <View style={styles.infoGroup}>
            <Text style={styles.label}>Nome</Text>
            <Text style={styles.value}>
              {appUser?.name?.trim() || "Não informado"}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGroup}>
            <Text style={styles.label}>E-mail</Text>
            <Text style={styles.value}>
              {appUser?.email?.trim() || "Não informado"}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGroup}>
            <Text style={styles.label}>Perfil de acesso</Text>
            <Text style={styles.value}>
              {appUser?.role === "owner"
                ? "Administrador principal"
                : appUser?.role === "admin"
                ? "Administrador"
                : "Visualizador"}
            </Text>
          </View>
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair da conta</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },

  infoGroup: {
    marginBottom: 12,
  },

  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },

  value: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },

  logoutButton: {
    backgroundColor: colors.error,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});