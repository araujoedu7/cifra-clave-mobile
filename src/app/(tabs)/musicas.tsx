import ScreenContainer from "@/src/components/ScreenContainer";
import { colors } from "@/src/constants/colors";
import { useAlert } from "@/src/contexts/AlertContext";
import { db } from "@/src/firebase/config";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    updateDoc,
} from "firebase/firestore";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
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

export default function MusicasScreen() {
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [pastas, setPastas] = useState<Pasta[]>([]);
  const [loading, setLoading] = useState(true);
  const alert = useAlert();

  const [menuVisible, setMenuVisible] = useState(false);
  const [musicaSelecionada, setMusicaSelecionada] =
    useState<Musica | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [musicasSnap, pastasSnap] = await Promise.all([
        getDocs(query(collection(db, "musicas"), orderBy("titulo", "asc"))),
        getDocs(query(collection(db, "pastas"), orderBy("nome", "asc"))),
      ]);

      setMusicas(
        musicasSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Musica[]
      );

      setPastas(
        pastasSnap.docs.map((d) => ({
          id: d.id,
          nome: d.data().nome,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function getNomeDaPasta(id?: string | null) {
    if (!id) return "Sem pasta";
    return pastas.find((p) => p.id === id)?.nome ?? "Sem pasta";
  }

  function abrirMenu(musica: Musica) {
    setMusicaSelecionada(musica);
    setMenuVisible(true);
  }

  function fecharMenu() {
    setMenuVisible(false);
  }

  async function selecionarPasta(pastaId: string | null) {
    if (!musicaSelecionada) return;

    await updateDoc(doc(db, "musicas", musicaSelecionada.id), {
      pastaId,
    });

    await loadData();
    setMenuVisible(false);
  }

  async function excluirMusica() {
    if (!musicaSelecionada) return;

    alert.showAlert({
      title: "Excluir música",
      message: `Deseja excluir "${musicaSelecionada.titulo}"?`,
      buttons: [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await deleteDoc(doc(db, "musicas", musicaSelecionada.id));
            await loadData();
            setMenuVisible(false);
          },
        },
      ],
    });
  }

  function renderItem({ item }: { item: Musica }) {
    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/musica/[id]",
            params: { id: item.id },
          })
        }
      >
        <View style={styles.row}>
          <View style={styles.cardInfo}>
            <Text style={styles.title}>{item.titulo}</Text>

            {!!item.artista && (
              <Text style={styles.subtitle}>{item.artista}</Text>
            )}

            <Text style={styles.meta}>
              {item.tom ? `Tom: ${item.tom}` : ""} •{" "}
              {getNomeDaPasta(item.pastaId)}
            </Text>
          </View>

          <Pressable
            style={styles.menuButton}
            onPress={() => abrirMenu(item)}
          >
            <Ionicons name="menu" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      </Pressable>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>Músicas</Text>
          <Text style={styles.screenSubtitle}>
            Toque em uma música para abrir a cifra
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
        <ActivityIndicator color={colors.primary} />
      ) : (
        <FlatList
          data={musicas}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhuma música cadastrada ainda.
            </Text>
          }
        />
      )}

      <Modal
        transparent
        visible={menuVisible}
        animationType="slide"
        onRequestClose={fecharMenu}
      >
        <Pressable style={styles.overlay} onPress={fecharMenu}>
          <Pressable style={styles.bottomSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            <Text style={styles.modalTitle}>{musicaSelecionada?.titulo}</Text>

            <Text style={styles.modalSubtitle}>Escolha a pasta</Text>

            <Text style={styles.currentFolder}>
              Atual: {getNomeDaPasta(musicaSelecionada?.pastaId)}
            </Text>

            <Pressable
              style={styles.option}
              onPress={() => selecionarPasta(null)}
            >
              <Text style={styles.optionText}>Sem pasta</Text>
            </Pressable>

            {pastas.map((pasta) => {
              const isSelected = pasta.id === musicaSelecionada?.pastaId;

              return (
                <Pressable
                  key={pasta.id}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                  ]}
                  onPress={() => selecionarPasta(pasta.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {pasta.nome}
                  </Text>
                </Pressable>
              );
            })}

            <View style={styles.divider} />

            <Pressable style={styles.deleteButton} onPress={excluirMusica}>
              <Text style={styles.deleteButtonText}>Excluir música</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  screenSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  title: {
    fontWeight: "700",
    fontSize: 16,
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  meta: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
  },
  menuButton: {
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.textMuted,
    opacity: 0.5,
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    color: "#FFFFFF",
  },
  modalSubtitle: {
    color: "#FFFFFF",
    marginBottom: 10,
  },
  currentFolder: {
    marginBottom: 12,
    fontSize: 13,
    color: "#FFFFFF",
  },
  option: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  optionText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  optionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  deleteButton: {
    backgroundColor: "#B42318",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFF",
    fontWeight: "700",
  },
});