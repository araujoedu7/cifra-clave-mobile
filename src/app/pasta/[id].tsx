import ScreenContainer from "@/src/components/ScreenContainer";
import { colors } from "@/src/constants/colors";
import { useAlert } from "@/src/contexts/AlertContext";
import { db } from "@/src/firebase/config";
import { router, useLocalSearchParams } from "expo-router";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Musica = {
  id: string;
  titulo: string;
  artista?: string;
  tom?: string;
  pastaId?: string | null;
};

type Pasta = {
  id: string;
  nome: string;
};

export default function PastaDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [pasta, setPasta] = useState<Pasta | null>(null);
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const alert = useAlert();

  async function loadPasta() {
    if (!id) return;

    const ref = doc(db, "pastas", String(id));
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      setPasta(null);
      return;
    }

    const data = snapshot.data();

    setPasta({
      id: snapshot.id,
      nome: data.nome ?? "Pasta",
    });
  }

  async function loadMusicas() {
    if (!id) return;

    const ref = collection(db, "musicas");
    const q = query(ref, where("pastaId", "==", String(id)));
    const snapshot = await getDocs(q);

    const lista: Musica[] = snapshot.docs.map((item) => {
      const data = item.data();

      return {
        id: item.id,
        titulo: data.titulo ?? "",
        artista: data.artista ?? "",
        tom: data.tom ?? "",
        pastaId: data.pastaId ?? null,
      };
    });

    lista.sort((a, b) => a.titulo.localeCompare(b.titulo));

    setMusicas(lista);
  }

  async function loadData() {
    if (!id) return;

    try {
      setLoading(true);
      await Promise.all([loadPasta(), loadMusicas()]);
    } catch (error) {
      console.log("Erro ao carregar pasta:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function removerDaPasta(musicaId: string) {
    try {
      setActionLoadingId(musicaId);

      await updateDoc(doc(db, "musicas", musicaId), {
        pastaId: null,
      });

      await loadMusicas();
    } catch (error) {
      console.log("Erro ao remover música da pasta:", error);
      alert.showAlert({
        title: "Erro",
        message: "Não foi possível remover a música da pasta.",
      });
    } finally {
      setActionLoadingId(null);
    }
  }

  function confirmarRemoverDaPasta(musica: Musica) {
    alert.showAlert({
      title: "Remover da pasta",
      message: `Deseja remover "${musica.titulo}" desta pasta?`,
      buttons: [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => removerDaPasta(musica.id),
        },
      ],
    });
  }

  async function excluirMusica(musicaId: string) {
    try {
      setActionLoadingId(musicaId);

      await deleteDoc(doc(db, "musicas", musicaId));
      await loadMusicas();
    } catch (error) {
      console.log("Erro ao excluir música:", error);
      alert.showAlert({
        title: "Erro",
        message: "Não foi possível excluir a música.",
      });
    } finally {
      setActionLoadingId(null);
    }
  }

  function confirmarExcluirMusica(musica: Musica) {
    alert.showAlert({
      title: "Excluir música",
      message: `Deseja excluir "${musica.titulo}"? Essa ação não poderá ser desfeita.`,
      buttons: [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => excluirMusica(musica.id),
        },
      ],
    });
  }

  function renderItem({ item }: { item: Musica }) {
    const disabled = actionLoadingId === item.id;

    return (
      <View style={styles.card}>
        <Pressable
          style={styles.cardMain}
          onPress={() =>
            router.push({
              pathname: "/musica/[id]",
              params: { id: item.id },
            })
          }
        >
          <Text style={styles.cardTitle}>{item.titulo}</Text>

          {!!item.artista && (
            <Text style={styles.cardSubtitle}>{item.artista}</Text>
          )}

          {!!item.tom && <Text style={styles.cardMeta}>Tom: {item.tom}</Text>}
        </Pressable>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.secondaryButton, disabled && styles.buttonDisabled]}
            onPress={() => confirmarRemoverDaPasta(item)}
            disabled={disabled}
          >
            <Text style={styles.secondaryButtonText}>
              {disabled ? "Aguarde..." : "Remover da pasta"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.dangerButton, disabled && styles.buttonDisabled]}
            onPress={() => confirmarExcluirMusica(item)}
            disabled={disabled}
          >
            <Text style={styles.dangerButtonText}>Excluir</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScreenContainer>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>{pasta?.nome ?? "Pasta"}</Text>
            <Text style={styles.subtitle}>
              {musicas.length === 1
                ? "1 música nesta pasta"
                : `${musicas.length} músicas nesta pasta`}
            </Text>
          </View>

          <FlatList
            data={musicas}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Pasta vazia</Text>
                <Text style={styles.emptyText}>
                  Adicione músicas a esta pasta pela aba de músicas.
                </Text>
              </View>
            }
          />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  cardMain: {
    marginBottom: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  cardMeta: {
    color: colors.primary,
    fontSize: 13,
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  dangerButton: {
    backgroundColor: "#B42318",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emptyBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
});