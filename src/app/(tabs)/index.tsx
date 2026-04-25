import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ScreenContainer from "@/src/components/ScreenContainer";
import { useAuth } from "@/src/contexts/AuthContext";

const MARIAN_BACKGROUND =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Salus_Populi_Romani_after_restoration.jpg";

const GROUP_IMAGE =
  "https://scontent-for2-2.cdninstagram.com/v/t51.82787-15/654195274_18055474451686648_4582340787407191734_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=107&ig_cache_key=MzM5MjgyNzA1NzMyNTY0MDUzNA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjEyMDB4MTIwMC5zZHIuQzMifQ%3D%3D&_nc_ohc=z-OHf7qcQccQ7kNvwF3LP_i&_nc_oc=AdrcwmkaD4jf4NItF2KnFhG54uTSLg7XmG0JpJtCLe5jUoa1s77_NoYrkgMlRzTHg4s&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-for2-2.cdninstagram.com&_nc_gid=yTYfbBX9n6WN-D2Dp2H8OQ&_nc_ss=7a32e&oh=00_Af205eFCVpIRpJufR4rIi85qxW65PjMk_jFMDxRy0Q3B1Q&oe=69E5B222";

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
              <Text style={styles.badgeText}>
                Paróquia N. Senhora da Conceição.
              </Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Totus Tuus</Text>
            <Text style={styles.cardText}>
              Organize o repertório, acompanhe as cifras e sirva com mais paz
              durante ensaios, encontros e celebrações.
            </Text>
          </View>

          <View style={styles.photoCard}>
            <Image
              source={{ uri: GROUP_IMAGE }}
              style={styles.groupImage}
              resizeMode="cover"
            />

            <View style={styles.photoFooter}>
              <Text style={styles.photoCaption}>
                Servindo com música, unidade e devoção.
              </Text>
              <Text style={styles.roleText}>Perfil atual: {roleLabel}</Text>
            </View>
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
  photoCard: {
    backgroundColor: "#102B55",
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  photoHeader: {
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  photoTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  photoText: {
    color: "#D7E8FF",
    fontSize: 15,
    lineHeight: 23,
  },
  groupImage: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    backgroundColor: "#0B1F3D",
  },
  photoFooter: {
    paddingHorizontal: 4,
    paddingTop: 12,
  },
  photoCaption: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  roleText: {
    color: "#9EC5FF",
    fontSize: 13,
    fontWeight: "600",
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