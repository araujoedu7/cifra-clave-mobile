import ScreenContainer from "@/src/components/ScreenContainer";
import { colors } from "@/src/constants/colors";
import { useAlert } from "@/src/contexts/AlertContext";
import { db } from "@/src/firebase/config";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Pasta = {
  id: string;
  nome: string;
  createdAt?: Timestamp;
};

export default function PastasScreen() {
  const [pastas, setPastas] = useState<Pasta[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const alert = useAlert();

  const loadPastas = useCallback(async () => {
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPastas();
    }, [loadPastas])
  );

  async function excluirPasta(pastaId: string, pastaNome: string) {
    try {
      setDeletingId(pastaId);

      const musicaRef = collection(db, "musicas");
      const musicaQuery = query(musicaRef, where("pastaId", "==", pastaId));
      const musicaSnapshot = await getDocs(musicaQuery);

      await Promise.all(
        musicaSnapshot.docs.map((item) =>
          updateDoc(doc(db, "musicas", item.id), {
            pastaId: null,
          })
        )
      );

      await deleteDoc(doc(db, "pastas", pastaId));
      await loadPastas();
    } catch (error) {
      console.log("Erro ao excluir pasta:", error);
      alert.showAlert({
        title: "Erro",
        message: "Não foi possível excluir a pasta.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  function confirmarExcluirPasta(pasta: Pasta) {
    alert.showAlert({
      title: "Excluir pasta",
      message: `Deseja excluir a pasta "${pasta.nome}"? Essa ação removerá a pasta e desvinculará as músicas.`,
      buttons: [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => excluirPasta(pasta.id, pasta.nome),
        },
      ],
    });
  }

  function renderItem({ item }: { item: Pasta }) {
    const isDeleting = deletingId === item.id;

    return (
      <View style={styles.cardContainer}>
        <Pressable
          style={[styles.card, isDeleting && styles.cardDisabled]}
          onPress={() => router.push({
            pathname: "/pasta/[id]",
            params: { id: item.id },
          })}
          disabled={isDeleting}
        >
          <View style={styles.cardContent}>
            <View style={styles.folderIcon}>
              <Text style={styles.folderIconText}>📁</Text>
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.nome}</Text>
              <Text style={styles.cardSubtitle}>
                Toque para abrir esta pasta
              </Text>
            </View>

            <View style={styles.cardActions}>
              <Pressable
                style={[styles.deleteIcon, isDeleting && styles.buttonDisabled]}
                onPress={() => confirmarExcluirPasta(item)}
                disabled={isDeleting}
              >
                <Ionicons name="trash-outline" size={20} color="#B42318" />
              </Pressable>
              <Text style={styles.chevron}>›</Text>
            </View>
          </View>
        </Pressable>
      </View>
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
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={pastas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
  cardContainer: {
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  folderIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  folderIconText: {
    fontSize: 20,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteIcon: {
    padding: 8,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 26,
    fontWeight: "400",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
});