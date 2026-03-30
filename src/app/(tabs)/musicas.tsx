import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import ScreenContainer from "@/src/components/ScreenContainer";
import { colors } from "@/src/constants/colors";
import { db } from "@/src/firebase/config";

type Musica = {
  id: string;
  titulo: string;
  artista?: string;
  tom?: string;
  cifra?: string;
  createdAt?: Timestamp;
};

export default function MusicasScreen() {
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMusicas() {
    try {
      setLoading(true);

      const ref = collection(db, "musicas");
      const q = query(ref, orderBy("titulo", "asc"));
      const snapshot = await getDocs(q);

      const lista: Musica[] = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          titulo: data.titulo ?? "",
          artista: data.artista ?? "",
          tom: data.tom ?? "",
          cifra: data.cifra ?? "",
          createdAt: data.createdAt,
        };
      });

      setMusicas(lista);
    } catch (error) {
      console.log("Erro ao buscar músicas:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMusicas();
  }, []);

  function renderItem({ item }: { item: Musica }) {
    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/musica/${item.id}`)}
      >
        <Text style={styles.cardTitle}>{item.titulo}</Text>

        {!!item.artista && (
          <Text style={styles.cardSubtitle}>{item.artista}</Text>
        )}

        {!!item.tom && <Text style={styles.cardMeta}>Tom: {item.tom}</Text>}
      </Pressable>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Músicas</Text>
          <Text style={styles.subtitle}>
            Toque em uma música para abrir a cifra.
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/nova-musica")}
        >
          <Text style={styles.addButtonText}>+ Nova</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={musicas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhuma música cadastrada ainda.
            </Text>
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: "700",
  },
  loader: {
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  cardMeta: {
    color: colors.primary,
    fontSize: 13,
    marginTop: 6,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
});