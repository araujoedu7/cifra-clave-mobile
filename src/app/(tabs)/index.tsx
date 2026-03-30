import { ImageBackground, ScrollView, StyleSheet, Text, View } from "react-native";
import ScreenContainer from "@/src/components/ScreenContainer";
import { useAuth } from "@/src/contexts/AuthContext";

const MARIAN_BACKGROUND =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Salus_Populi_Romani_after_restoration.jpg";

export default function HomeScreen() {
  const { appUser } = useAuth();

  const saudacao = appUser?.nome?.trim()?.split(" ")[0] || "seja bem-vindo";

  const roleLabel =
    appUser?.role === "owner"
      ? "Administrador principal"
      : appUser?.role === "admin"
      ? "Administrador"
      : appUser?.role === "viewer"
      ? "Visualizador"
      : "Não carregado";

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ImageBackground
          source={{ uri: MARIAN_BACKGROUND }}
          resizeMode="cover"
          imageStyle={styles.heroImage}
          style={styles.hero}
        >
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.overline}>Totus Tuus</Text>
            <Text style={styles.title}>Salve Maria, {saudacao}</Text>
            <Text style={styles.subtitle}>
              Um app para organizar músicas, cifras e pastas do ministério com
              beleza, simplicidade e reverência.
            </Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>Paróquia N. Senhora da Conceição.</Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Seu acesso</Text>
            <Text style={styles.cardTitle}>{roleLabel}</Text>
            <Text style={styles.cardText}>
              {appUser?.email ?? "Conta ainda não carregada."}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Missão</Text>
            <Text style={styles.cardTitle}>Totus Tuus</Text>
            <Text style={styles.cardText}>
              Organize o repertório, acompanhe as cifras e sirva com mais paz
              durante ensaios, encontros e celebrações.
            </Text>
          </View>

          <View style={styles.prayerCard}>
            <Text style={styles.prayerLabel}>Consagração</Text>
            <Text style={styles.prayerText}>
              “Totus Tuus ego sum, et omnia mea tua sunt.”
            </Text>
            <Text style={styles.prayerSubtext}>
              Sou todo teu, Maria, e tudo o que tenho é teu.
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
    minHeight: 340,
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 18,
    justifyContent: "flex-end",
  },
  heroImage: {
    borderRadius: 28,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 24, 58, 0.68)",
  },
  heroContent: {
    padding: 22,
  },
  overline: {
    color: "#B8D7FF",
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
    maxWidth: "88%",
  },
  subtitle: {
    color: "#E2EEFF",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 18,
    maxWidth: "92%",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    gap: 14,
  },
  card: {
    backgroundColor: "#102B55",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardLabel: {
    color: "#9EC5FF",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  cardText: {
    color: "#D7E8FF",
    fontSize: 15,
    lineHeight: 23,
  },
  prayerCard: {
    backgroundColor: "#173869",
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
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  prayerText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 30,
    marginBottom: 8,
  },
  prayerSubtext: {
    color: "#D7E8FF",
    fontSize: 15,
    lineHeight: 23,
  },
});