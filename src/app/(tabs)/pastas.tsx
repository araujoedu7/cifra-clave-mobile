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

type Pasta = {
  id: string;
  nome: string;
  createdAt?: Timestamp;
};

export default function PastasScreen() {
  const [pastas, setPastas] = useState<Pasta[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPastas() {
    try {
      setLoading(true);

      const ref = collection(db, "pastas");
      const q = query(ref, orderBy("nome", "asc"));
      const snapshot = await getDocs(q);

      const lista: Pasta[] = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          nome: data.nome ?? "",
          createdAt: data.createdAt,
        };
      });

      setPastas(lista);
    } catch (error) {
      console.log("Erro ao buscar pastas:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPastas();
  }, []);

  function renderItem({ item }: { item: Pasta }) {
    return (
      <Pressable
        style={styles.card}
        onPress={() => {
          // depois vamos abrir a pasta
          console.log("Abrir pasta:", item.id);
        }}
      >
        <Text style={styles.cardTitle}>{item.nome}</Text>
      </Pressable>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Pastas</Text>
          <Text style={styles.subtitle}>
            Organize suas músicas em pastas.
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/nova-pasta")}
        >
          <Text style={styles.addButtonText}>+ Nova</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={pastas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhuma pasta criada ainda.
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
  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
});