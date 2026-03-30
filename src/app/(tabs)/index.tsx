import { ScrollView, StyleSheet, Text, View } from "react-native";
import ScreenContainer from "@/src/components/ScreenContainer";
import { colors } from "@/src/constants/colors";
import { useAuth } from "@/src/contexts/AuthContext";

export default function HomeScreen() {
  const { appUser } = useAuth();

  const saudacao =
    appUser?.nome?.trim()?.split(" ")[0] || "seja bem-vindo";

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.hero}>
          <View style={styles.backgroundGlowTop} />
          <View style={styles.backgroundGlowBottom} />
          <View style={styles.maryHalo} />
          <View style={styles.maryCrescent} />

          <View style={styles.rosaryRow}>
            <View style={styles.rosaryDot} />
            <View style={styles.rosaryDotSmall} />
            <View style={styles.rosaryDot} />
            <View style={styles.rosaryDotSmall} />
            <View style={styles.rosaryDot} />
          </View>

          <Text style={styles.overline}>Totus Tuus</Text>
          <Text style={styles.title}>Salve Maria, {saudacao}</Text>
          <Text style={styles.subtitle}>
            Organize as músicas, cifras e pastas do ministério com uma experiência
            simples, bonita e feita para acompanhar o grupo em cada encontro.
          </Text>

          <View style={styles.highlightCard}>
            <Text style={styles.highlightLabel}>Grupo mariano</Text>
            <Text style={styles.highlightTitle}>Nossa Senhora • Totus Tuus</Text>
            <Text style={styles.highlightText}>
              Um espaço para servir com música, reverência e organização.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Seu acesso</Text>
            <Text style={styles.cardValue}>
              {appUser?.role === "owner"
                ? "Administrador principal"
                : appUser?.role === "admin"
                ? "Administrador"
                : appUser?.role === "viewer"
                ? "Visualizador"
                : "Não carregado"}
            </Text>
            <Text style={styles.cardDescription}>
              {appUser?.email ?? "Conta ainda não carregada."}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Propósito</Text>
            <Text style={styles.cardDescription}>
              Aqui o ministério pode reunir músicas, organizar pastas e tocar com
              mais tranquilidade durante encontros, missas e momentos de oração.
            </Text>
          </View>

          <View style={styles.prayerCard}>
            <Text style={styles.prayerLabel}>Inspiração do dia</Text>
            <Text style={styles.prayerText}>
              “Totus Tuus Mariae” — inteiramente teu, Maria.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#0E2347",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 18,
  },
  backgroundGlowTop: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(88, 166, 255, 0.18)",
    top: -70,
    right: -40,
  },
  backgroundGlowBottom: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(173, 216, 255, 0.10)",
    bottom: -50,
    left: -30,
  },
  maryHalo: {
    position: "absolute",
    top: 34,
    right: 26,
    width: 72,
    height: 72,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.16)",
  },
  maryCrescent: {
    position: "absolute",
    bottom: 28,
    right: 34,
    width: 46,
    height: 46,
    borderRadius: 999,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: "rgba(255,255,255,0.15)",
    transform: [{ rotate: "-35deg" }],
  },
  rosaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  rosaryDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  rosaryDotSmall: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  overline: {
    color: "#B9D9FF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 38,
    marginBottom: 10,
    maxWidth: "82%",
  },
  subtitle: {
    color: "#D8E9FF",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
    maxWidth: "88%",
  },
  highlightCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  highlightLabel: {
    color: "#B9D9FF",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  highlightTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  highlightText: {
    color: "#D8E9FF",
    fontSize: 14,
    lineHeight: 22,
  },
  section: {
    gap: 14,
  },
  infoCard: {
    backgroundColor: "#122A54",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardTitle: {
    color: "#9EC5FF",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  cardValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  cardDescription: {
    color: "#D3E4FF",
    fontSize: 15,
    lineHeight: 23,
  },
  prayerCard: {
    backgroundColor: "#173564",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  prayerLabel: {
    color: "#9EC5FF",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  prayerText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 28,
  },
});