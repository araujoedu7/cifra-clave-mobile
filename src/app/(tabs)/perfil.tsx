import ScreenContainer from "@/src/components/ScreenContainer";
import { colors } from "@/src/constants/colors";
import { useAlert } from "@/src/contexts/AlertContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { db } from "@/src/firebase/config";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Stats = {
  musicas: number;
  pastas: number;
};

export default function PerfilScreen() {
  const { appUser, logout } = useAuth();
  const alert = useAlert();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ musicas: 0, pastas: 0 });

  const loadStats = useCallback(async () => {
    try {
      const [musicasSnap, pastasSnap] = await Promise.all([
        getDocs(query(collection(db, "musicas"), where("createdBy", "==", "user"))),
        getDocs(query(collection(db, "pastas"), where("createdBy", "==", "user"))),
      ]);
      setStats({
        musicas: musicasSnap.size,
        pastas: pastasSnap.size,
      });
    } catch (error) {
      console.log("Erro ao carregar estatísticas:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  function getInitials(name: string): string {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  function getRoleBadge(role?: string) {
    switch (role) {
      case "owner":
        return { label: "Administrador", color: colors.primary, icon: "star" };
      case "admin":
        return { label: "Admin", color: "#F59E0B", icon: "shield-checkmark" };
      default:
        return { label: "Visualizador", color: "#6B7280", icon: "eye" };
    }
  }

  async function handleLogout() {
    alert.showAlert({
      title: "Sair da conta",
      message: "Tem certeza que deseja sair?",
      buttons: [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch {
              alert.showAlert({
                title: "Erro",
                message: "Não foi possível sair da conta.",
              });
            }
          },
        },
      ],
    });
  }

  const roleBadge = getRoleBadge(appUser?.role);

  return (
    <ScreenContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Meu perfil</Text>
        <Text style={styles.subtitle}>
          Gerencie suas informações e configurações.
        </Text>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(appUser?.nome || "U")}
            </Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.userName}>
              {appUser?.nome?.trim() || "Usuário"}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: roleBadge.color + "20" }]}>
              <Ionicons name={roleBadge.icon as any} size={12} color={roleBadge.color} />
              <Text style={[styles.roleBadgeText, { color: roleBadge.color }]}>
                {roleBadge.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Pressable style={styles.statCard} onPress={() => router.push("/musicas")}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary + "20" }]}>
              <Ionicons name="musical-notes" size={20} color={colors.primary} />
            </View>
            <Text style={styles.statNumber}>{stats.musicas}</Text>
            <Text style={styles.statLabel}>Músicas</Text>
          </Pressable>

          <Pressable style={styles.statCard} onPress={() => router.push("/pastas")}>
            <View style={[styles.statIcon, { backgroundColor: "#F59E0B20" }]}>
              <Ionicons name="folder" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statNumber}>{stats.pastas}</Text>
            <Text style={styles.statLabel}>Pastas</Text>
          </Pressable>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações da conta</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="person-outline" size={18} color={colors.textMuted} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Nome</Text>
              <Text style={styles.value}>
                {appUser?.nome?.trim() || "Não informado"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.label}>E-mail</Text>
              <Text style={styles.value}>
                {appUser?.email?.trim() || "Não informado"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.textMuted} />
            </View>
            <View style={styles.infoContent}>
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
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ações rápidas</Text>
          
          <Pressable style={styles.actionRow} onPress={() => router.push("/musicas")}>
            <View style={styles.actionIcon}>
              <Ionicons name="musical-notes-outline" size={18} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Ver todas as músicas</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>

          <Pressable style={styles.actionRow} onPress={() => router.push("/pastas")}>
            <View style={styles.actionIcon}>
              <Ionicons name="folder-outline" size={18} color="#F59E0B" />
            </View>
            <Text style={styles.actionText}>Ver pastas</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Sair da conta</Text>
        </Pressable>

        <Text style={styles.version}>Cifra Clave v1.0.0</Text>
      </ScrollView>
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
    color: colors.textMuted,
    marginBottom: 20,
  },

  // Avatar Section
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  avatarInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Card
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },

  // Info Row
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "500",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },

  // Action Row
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },

  // Logout Button
  logoutButton: {
    backgroundColor: colors.danger,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Version
  version: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 16,
  },

  // Legacy styles (kept for compatibility)
  infoGroup: {
    marginBottom: 12,
  },
});